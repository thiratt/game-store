using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using api.Models.Dtos;
using api.Models.Request;
using api.Models.Response;
using api.Models.Tables;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace api.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class PurchaseController(KiroContext context, ILogger<PurchaseController> logger) : ControllerBase
    {
        private readonly KiroContext _context = context;
        private readonly ILogger<PurchaseController> _logger = logger;

        private const string TRANSACTION_TYPE_PURCHASE = "PURCHASE";
        private const decimal MAX_WALLET_BALANCE = 999999999.99m;
        private const decimal MIN_PRICE = 0.01m;

        private async Task<Guid> GetCurrentUserIdAsync()
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!string.IsNullOrEmpty(userIdClaim) && Guid.TryParse(userIdClaim, out Guid claimUserId))
                {
                    return claimUserId;
                }

                if (!Request.Headers.TryGetValue("X-User-ID", out var userIdHeader) ||
                    string.IsNullOrWhiteSpace(userIdHeader) ||
                    !Guid.TryParse(userIdHeader, out Guid userId))
                {
                    _logger.LogWarning("Invalid or missing user ID in request");
                    throw new UnauthorizedAccessException("User ID is missing or invalid.");
                }

                var userExists = await _context.Accounts.AnyAsync(a => a.Id == userId);
                if (!userExists)
                {
                    _logger.LogWarning("User ID {UserId} not found in database", userId);
                    throw new UnauthorizedAccessException("Invalid user.");
                }

                return userId;
            }
            catch (Exception ex) when (!(ex is UnauthorizedAccessException))
            {
                _logger.LogError(ex, "Error retrieving user ID");
                throw new UnauthorizedAccessException("Authentication failed.");
            }
        }

        private static async Task<bool> ValidateUserOwnsCartAsync(Guid userId, List<CartItem> cartItems)
        {
            return await Task.FromResult(cartItems.All(ci => ci.UserId == userId));
        }

        private async Task<List<Game>> ValidateGamesExistAndAvailableAsync(List<Guid> gameIds)
        {
            var games = await _context.Games
                .Where(g => gameIds.Contains(g.Id))
                .ToListAsync();

            if (games.Count != gameIds.Count)
            {
                var missingGameIds = gameIds.Except(games.Select(g => g.Id));
                _logger.LogWarning("Missing games: {MissingGameIds}", string.Join(", ", missingGameIds));
                throw new InvalidOperationException("Some games are no longer available.");
            }

            var invalidGames = games.Where(g => g.Price < MIN_PRICE).ToList();
            if (invalidGames.Count != 0)
            {
                _logger.LogWarning("Invalid game prices found: {GameIds}", string.Join(", ", invalidGames.Select(g => g.Id)));
                throw new InvalidOperationException("Some games have invalid pricing.");
            }

            return games;
        }

        [HttpPost("checkout")]
        public async Task<ActionResult<KiroResponse>> CheckoutCart()
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var userId = await GetCurrentUserIdAsync();
                _logger.LogInformation("Starting checkout process for user {UserId}", userId);

                var cartItems = await _context.CartItems
                    .Include(c => c.Game)
                    .Where(c => c.UserId == userId)
                    .ToListAsync();

                if (cartItems.Count == 0)
                {
                    _logger.LogInformation("Empty cart for user {UserId}", userId);
                    return BadRequest(new KiroResponse
                    {
                        Success = false,
                        Message = "ตะกร้าสินค้าของคุณว่างเปล่า"
                    });
                }

                if (!await ValidateUserOwnsCartAsync(userId, cartItems))
                {
                    _logger.LogWarning("User {UserId} attempting to checkout cart items they don't own", userId);
                    return Forbid();
                }

                var gameIds = cartItems.Select(c => c.GameId).Distinct().ToList();

                var games = await ValidateGamesExistAndAvailableAsync(gameIds);
                var gameDict = games.ToDictionary(g => g.Id, g => g);

                var ownedGameIds = await _context.UserGames
                    .Where(ug => ug.UserId == userId && gameIds.Contains(ug.GameId))
                    .Select(ug => ug.GameId)
                    .ToListAsync();

                if (ownedGameIds.Count != 0)
                {
                    var ownedGameTitles = ownedGameIds
                        .Where(id => gameDict.ContainsKey(id))
                        .Select(id => gameDict[id].Title)
                        .ToList();

                    _logger.LogInformation("User {UserId} already owns games: {OwnedGames}", userId, string.Join(", ", ownedGameTitles));

                    return BadRequest(new KiroResponse
                    {
                        Success = false,
                        Message = $"คุณมีเกมเหล่านี้อยู่แล้ว: {string.Join(", ", ownedGameTitles)}"
                    });
                }

                var totalPrice = cartItems.Sum(c => gameDict.ContainsKey(c.GameId) ? gameDict[c.GameId].Price : 0);

                if (totalPrice <= 0)
                {
                    _logger.LogWarning("Invalid total price calculated: {TotalPrice} for user {UserId}", totalPrice, userId);
                    return BadRequest(new KiroResponse
                    {
                        Success = false,
                        Message = "ไม่สามารถคำนวณราคาได้"
                    });
                }

                var finalPrice = totalPrice;

                var user = await _context.Accounts
                    .Where(a => a.Id == userId)
                    .FirstOrDefaultAsync();

                if (user == null)
                {
                    _logger.LogWarning("User {UserId} not found during checkout", userId);
                    return NotFound(new KiroResponse
                    {
                        Success = false,
                        Message = "ไม่พบบัญชีผู้ใช้"
                    });
                }

                if (user.WalletBalance < finalPrice)
                {
                    _logger.LogInformation("Insufficient balance for user {UserId}. Required: {Required}, Available: {Available}",
                        userId, finalPrice, user.WalletBalance);

                    return BadRequest(new KiroResponse
                    {
                        Success = false,
                        Message = $"ยอดเงินในกระเป๋าไม่เพียงพอ"
                    });
                }

                var newBalance = user.WalletBalance - finalPrice;
                if (newBalance < 0)
                {
                    _logger.LogWarning("Potential balance underflow for user {UserId}", userId);
                    return BadRequest(new KiroResponse
                    {
                        Success = false,
                        Message = "เกิดข้อผิดพลาดในการคำนวณยอดเงิน"
                    });
                }

                user.WalletBalance = newBalance;
                user.UpdatedAt = DateTime.UtcNow;

                var purchase = new Purchase
                {
                    Id = Guid.NewGuid(),
                    UserId = userId,
                    TotalPrice = totalPrice,
                    FinalPrice = finalPrice,
                    PurchasedAt = DateTime.UtcNow,
                    DiscountId = null
                };

                _context.Purchases.Add(purchase);

                var purchaseItems = cartItems
                    .Where(cartItem => gameDict.ContainsKey(cartItem.GameId))
                    .Select(cartItem => new PurchaseItem
                    {
                        PurchaseId = purchase.Id,
                        GameId = cartItem.GameId,
                        Price = gameDict[cartItem.GameId].Price
                    }).ToList();

                if (purchaseItems.Count == 0)
                {
                    _logger.LogWarning("No valid purchase items created for user {UserId}", userId);
                    return BadRequest(new KiroResponse
                    {
                        Success = false,
                        Message = "ไม่มีสินค้าที่ถูกต้องในตะกร้า"
                    });
                }

                _context.PurchaseItems.AddRange(purchaseItems);

                var userGames = purchaseItems.Select(pi => new UserGame
                {
                    UserId = userId,
                    GameId = pi.GameId,
                    OwnedAt = DateTime.UtcNow
                }).ToList();

                _context.UserGames.AddRange(userGames);

                var transactionHistory = new TransactionHistory
                {
                    UserId = userId,
                    Type = TRANSACTION_TYPE_PURCHASE,
                    Amount = -finalPrice,
                    ReferenceId = purchase.Id,
                    CreatedAt = DateTime.UtcNow
                };
                _context.TransactionHistories.Add(transactionHistory);

                _context.CartItems.RemoveRange(cartItems);

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                _logger.LogInformation("Purchase completed successfully for user {UserId}, purchase ID {PurchaseId}", userId, purchase.Id);

                var purchaseDto = new PurchaseDto
                {
                    Id = purchase.Id,
                    TotalPrice = purchase.TotalPrice,
                    FinalPrice = purchase.FinalPrice,
                    PurchasedAt = purchase.PurchasedAt,
                    Items = purchaseItems.Select(pi => new PurchaseItemDto
                    {
                        GameId = pi.GameId,
                        GameTitle = gameDict.ContainsKey(pi.GameId) ? gameDict[pi.GameId].Title : "Unknown Game",
                        Price = pi.Price
                    }).ToList()
                };

                return Ok(new KiroResponse
                {
                    Success = true,
                    Message = "ซื้อเกมเรียบร้อยแล้ว",
                    Data = purchaseDto
                });
            }
            catch (UnauthorizedAccessException ex)
            {
                await transaction.RollbackAsync();
                _logger.LogWarning("Unauthorized access during checkout: {Message}", ex.Message);
                return Unauthorized(new KiroResponse
                {
                    Success = false,
                    Message = "ไม่ได้รับอนุญาต"
                });
            }
            catch (InvalidOperationException ex)
            {
                await transaction.RollbackAsync();
                _logger.LogWarning("Invalid operation during checkout: {Message}", ex.Message);
                return BadRequest(new KiroResponse
                {
                    Success = false,
                    Message = ex.Message
                });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Unexpected error during checkout for user");
                return StatusCode(500, new KiroResponse
                {
                    Success = false,
                    Message = "เกิดข้อผิดพลาดในระบบ กรุณาลองใหม่อีกครั้ง"
                });
            }
        }

        [HttpGet("history")]
        public async Task<ActionResult<KiroResponse>> GetPurchaseHistory([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            try
            {
                if (page < 1) page = 1;
                if (pageSize < 1 || pageSize > 100) pageSize = 10;

                var userId = await GetCurrentUserIdAsync();
                _logger.LogInformation("Fetching purchase history for user {UserId}, page {Page}, pageSize {PageSize}", userId, page, pageSize);

                var skip = (page - 1) * pageSize;

                var totalCount = await _context.Purchases
                    .Where(p => p.UserId == userId)
                    .CountAsync();

                var purchases = await _context.Purchases
                    .Include(p => p.PurchaseItems)
                    .ThenInclude(pi => pi.Game)
                    .Where(p => p.UserId == userId)
                    .OrderByDescending(p => p.PurchasedAt)
                    .Skip(skip)
                    .Take(pageSize)
                    .ToListAsync();

                var purchaseDtos = purchases.Select(p => new PurchaseDto
                {
                    Id = p.Id,
                    TotalPrice = p.TotalPrice,
                    FinalPrice = p.FinalPrice,
                    PurchasedAt = p.PurchasedAt,
                    Items = p.PurchaseItems?.Select(pi => new PurchaseItemDto
                    {
                        GameId = pi.GameId,
                        GameTitle = pi.Game?.Title ?? "Unknown Game",
                        Price = pi.Price
                    }).ToList() ?? new List<PurchaseItemDto>()
                }).ToList();

                var responseData = new
                {
                    Purchases = purchaseDtos,
                    TotalCount = totalCount,
                    Page = page,
                    PageSize = pageSize,
                    TotalPages = (int)Math.Ceiling((double)totalCount / pageSize)
                };

                return Ok(new KiroResponse
                {
                    Success = true,
                    Data = responseData
                });
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning("Unauthorized access to purchase history: {Message}", ex.Message);
                return Unauthorized(new KiroResponse
                {
                    Success = false,
                    Message = "ไม่ได้รับอนุญาต"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching purchase history");
                return StatusCode(500, new KiroResponse
                {
                    Success = false,
                    Message = "เกิดข้อผิดพลาดในระบบ"
                });
            }
        }

        [HttpGet("owned-games")]
        public async Task<ActionResult<KiroResponse>> GetOwnedGames([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            try
            {
                if (page < 1) page = 1;
                if (pageSize < 1 || pageSize > 100) pageSize = 20;

                var userId = await GetCurrentUserIdAsync();
                _logger.LogInformation("Fetching owned games for user {UserId}, page {Page}, pageSize {PageSize}", userId, page, pageSize);

                var skip = (page - 1) * pageSize;

                var totalCount = await _context.UserGames
                    .Where(ug => ug.UserId == userId)
                    .CountAsync();

                var ownedGames = await _context.UserGames
                    .Include(ug => ug.Game)
                    .ThenInclude(g => g.Categories)
                    .Where(ug => ug.UserId == userId)
                    .OrderByDescending(ug => ug.OwnedAt)
                    .Skip(skip)
                    .Take(pageSize)
                    .ToListAsync();

                var gameDtos = ownedGames
                    .Where(ug => ug.Game != null)
                    .Select(ug => new GameDto
                    {
                        Id = ug.Game.Id,
                        Title = ug.Game.Title ?? "Unknown Game",
                        Description = ug.Game.Description,
                        Price = ug.Game.Price,
                        ReleaseDate = ug.Game.ReleaseDate,
                        ImageUrl = ug.Game.ImageUrl,
                        OwnedAt = ug.OwnedAt,
                        Categories = ug.Game.Categories?.Select(gc => new GameCategoryDto
                        {
                            Id = gc.Id,
                            Name = gc.Name ?? "Unknown Category"
                        }).ToList() ?? new List<GameCategoryDto>()
                    }).ToList();

                var responseData = new
                {
                    Games = gameDtos,
                    TotalCount = totalCount,
                    Page = page,
                    PageSize = pageSize,
                    TotalPages = (int)Math.Ceiling((double)totalCount / pageSize)
                };

                return Ok(new KiroResponse
                {
                    Success = true,
                    Data = responseData
                });
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning("Unauthorized access to owned games: {Message}", ex.Message);
                return Unauthorized(new KiroResponse
                {
                    Success = false,
                    Message = "ไม่ได้รับอนุญาต"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching owned games");
                return StatusCode(500, new KiroResponse
                {
                    Success = false,
                    Message = "เกิดข้อผิดพลาดในระบบ"
                });
            }
        }

        [HttpGet("verify-ownership/{gameId:guid}")]
        public async Task<ActionResult<KiroResponse>> VerifyGameOwnership(Guid gameId)
        {
            try
            {
                if (gameId == Guid.Empty)
                {
                    return BadRequest(new KiroResponse
                    {
                        Success = false,
                        Message = "รหัสเกมไม่ถูกต้อง"
                    });
                }

                var userId = await GetCurrentUserIdAsync();

                var isOwned = await _context.UserGames
                    .AnyAsync(ug => ug.UserId == userId && ug.GameId == gameId);

                return Ok(new KiroResponse
                {
                    Success = true,
                    Data = new { IsOwned = isOwned, GameId = gameId }
                });
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning("Unauthorized access to ownership verification: {Message}", ex.Message);
                return Unauthorized(new KiroResponse
                {
                    Success = false,
                    Message = "ไม่ได้รับอนุญาต"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error verifying game ownership for game {GameId}", gameId);
                return StatusCode(500, new KiroResponse
                {
                    Success = false,
                    Message = "เกิดข้อผิดพลาดในระบบ"
                });
            }
        }
    }
}
