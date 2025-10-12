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
    public class PurchaseController(KiroContext context) : ControllerBase
    {
        private readonly KiroContext _context = context;

        private Guid GetCurrentUserId()
        {
            bool isUserIdExists = Request.Headers.TryGetValue("X-User-ID", out var userIdHeader);
            if (!isUserIdExists || !Guid.TryParse(userIdHeader, out Guid userId))
            {
                System.Console.WriteLine("User ID header missing or invalid: " + userIdHeader);
                throw new UnauthorizedAccessException("User ID is missing or invalid.");
            }

            return userId;
        }

        [HttpPost("checkout")]
        public async Task<ActionResult<KiroResponse>> CheckoutCart()
        {
            try
            {
                var userId = GetCurrentUserId();

                var cartItems = await _context.CartItems
                    .Include(c => c.Game)
                    .Where(c => c.UserId == userId)
                    .ToListAsync();

                if (cartItems.Count == 0)
                {
                    return BadRequest(new KiroResponse
                    {
                        Success = false,
                        Message = "ตะกร้าสินค้าของคุณว่างเปล่า"
                    });
                }

                var gameIds = cartItems.Select(c => c.GameId).ToList();
                var ownedGames = await _context.UserGames
                    .Where(ug => ug.UserId == userId && gameIds.Contains(ug.GameId))
                    .Select(ug => ug.GameId)
                    .ToListAsync();

                if (ownedGames.Count != 0)
                {
                    var ownedGameTitles = cartItems
                        .Where(c => ownedGames.Contains(c.GameId))
                        .Select(c => c.Game.Title)
                        .ToList();

                    return BadRequest(new KiroResponse
                    {
                        Success = false,
                        Message = $"คุณมีเกมเหล่านี้อยู่แล้ว: {string.Join(", ", ownedGameTitles)}"
                    });
                }

                var totalPrice = cartItems.Sum(c => c.Game.Price);
                var finalPrice = totalPrice;

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

                var purchaseItems = cartItems.Select(cartItem => new PurchaseItem
                {
                    PurchaseId = purchase.Id,
                    GameId = cartItem.GameId,
                    Price = cartItem.Game.Price
                }).ToList();

                _context.PurchaseItems.AddRange(purchaseItems);

                var userGames = cartItems.Select(cartItem => new UserGame
                {
                    UserId = userId,
                    GameId = cartItem.GameId,
                    OwnedAt = DateTime.UtcNow
                }).ToList();

                _context.UserGames.AddRange(userGames);

                _context.CartItems.RemoveRange(cartItems);

                await _context.SaveChangesAsync();

                var purchaseDto = new PurchaseDto
                {
                    Id = purchase.Id,
                    TotalPrice = purchase.TotalPrice,
                    FinalPrice = purchase.FinalPrice,
                    PurchasedAt = purchase.PurchasedAt,
                    Items = [.. purchaseItems.Select(pi => new PurchaseItemDto
                    {
                        GameId = pi.GameId,
                        GameTitle = cartItems.First(c => c.GameId == pi.GameId).Game.Title,
                        Price = pi.Price
                    })]
                };

                return Ok(new KiroResponse
                {
                    Success = true,
                    Message = "ซื้อเกมเรียบร้อยแล้ว",
                    Data = purchaseDto
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new KiroResponse
                {
                    Success = false,
                    Message = "เกิดข้อผิดพลาดในระบบ",
                    Data = ex.Message
                });
            }
        }

        [HttpGet("history")]
        public async Task<ActionResult<KiroResponse>> GetPurchaseHistory()
        {
            try
            {
                var userId = GetCurrentUserId();

                var purchases = await _context.Purchases
                    .Include(p => p.PurchaseItems)
                    .ThenInclude(pi => pi.Game)
                    .Where(p => p.UserId == userId)
                    .OrderByDescending(p => p.PurchasedAt)
                    .ToListAsync();

                var purchaseDtos = purchases.Select(p => new PurchaseDto
                {
                    Id = p.Id,
                    TotalPrice = p.TotalPrice,
                    FinalPrice = p.FinalPrice,
                    PurchasedAt = p.PurchasedAt,
                    Items = [.. p.PurchaseItems.Select(pi => new PurchaseItemDto
                    {
                        GameId = pi.GameId,
                        GameTitle = pi.Game.Title,
                        Price = pi.Price
                    })]
                }).ToList();

                return Ok(new KiroResponse
                {
                    Success = true,
                    Data = purchaseDtos
                });
            }
            catch (Exception)
            {
                return StatusCode(500, new KiroResponse
                {
                    Success = false,
                    Message = "เกิดข้อผิดพลาดในระบบ"
                });
            }
        }

        [HttpGet("owned-games")]
        public async Task<ActionResult<KiroResponse>> GetOwnedGames()
        {
            try
            {
                var userId = GetCurrentUserId();

                var ownedGames = await _context.UserGames
                    .Include(ug => ug.Game)
                    .ThenInclude(g => g.Categories)
                    .Where(ug => ug.UserId == userId)
                    .OrderByDescending(ug => ug.OwnedAt)
                    .ToListAsync();

                var gameDtos = ownedGames.Select(ug => new GameDto
                {
                    Id = ug.Game.Id,
                    Title = ug.Game.Title,
                    Description = ug.Game.Description,
                    Price = ug.Game.Price,
                    ReleaseDate = ug.Game.ReleaseDate,
                    ImageUrl = ug.Game.ImageUrl,
                    OwnedAt = ug.OwnedAt,
                    Categories = [.. ug.Game.Categories.Select(gc => new GameCategoryDto
                    {
                        Id = gc.Id,
                        Name = gc.Name
                    })]
                }).ToList();

                return Ok(new KiroResponse
                {
                    Success = true,
                    Data = gameDtos
                });
            }
            catch (Exception)
            {
                return StatusCode(500, new KiroResponse
                {
                    Success = false,
                    Message = "เกิดข้อผิดพลาดในระบบ"
                });
            }
        }
    }
}