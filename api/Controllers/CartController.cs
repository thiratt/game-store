using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using api.Models.Tables;
using api.Models.Response;
using api.Models.Dtos;
using System.Security.Claims;
using Microsoft.Extensions.Configuration.UserSecrets;

namespace api.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class CartController(KiroContext context) : ControllerBase
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

        [HttpGet]
        public async Task<ActionResult<KiroResponse>> GetCartItems()
        {
            try
            {
                var userId = GetCurrentUserId();

                var cartItems = await _context.CartItems
                    .Include(ci => ci.Game)
                        .ThenInclude(g => g.Categories)
                    .Where(ci => ci.UserId == userId)
                    .OrderBy(ci => ci.AddedAt)
                    .Select(ci => new CartItemDto
                    {
                        Id = ci.Id,
                        GameId = ci.Game.Id,
                        Title = ci.Game.Title,
                        Price = ci.Game.Price,
                        ImageUrl = ci.Game.ImageUrl,
                        AddedAt = ci.AddedAt,
                        Categories = ci.Game.Categories.Select(gc => new GameCategoryDto
                        {
                            Id = gc.Id,
                            Name = gc.Name
                        }).ToList()
                    })
                    .ToListAsync();

                return Ok(new KiroResponse
                {
                    Success = true,
                    Data = cartItems,
                    Message = "ดึงข้อมูลตะกร้าสินค้าสำเร็จ"
                });
            }
            catch (Exception)
            {
                return StatusCode(500, new KiroResponse
                {
                    Success = false,
                    Message = "เกิดข้อผิดพลาดในการดึงข้อมูลตะกร้าสินค้า"
                });
            }
        }

        [HttpPost("{gameId}")]
        public async Task<ActionResult<KiroResponse>> AddToCart(Guid gameId)
        {
            try
            {
                var userId = GetCurrentUserId();

                // Check if game exists
                var game = await _context.Games.FindAsync(gameId);
                if (game == null)
                {
                    return NotFound(new KiroResponse
                    {
                        Success = false,
                        Message = "ไม่พบเกมที่ต้องการ"
                    });
                }

                // Check if item already in cart
                var existingCartItem = await _context.CartItems
                    .FirstOrDefaultAsync(ci => ci.UserId == userId && ci.GameId == gameId);

                if (existingCartItem != null)
                {
                    return BadRequest(new KiroResponse
                    {
                        Success = false,
                        Message = "เกมนี้อยู่ในตะกร้าสินค้าแล้ว"
                    });
                }

                // Check if user already owns this game
                var userOwnsGame = await _context.UserGames
                    .AnyAsync(ug => ug.UserId == userId && ug.GameId == gameId);

                if (userOwnsGame)
                {
                    return BadRequest(new KiroResponse
                    {
                        Success = false,
                        Message = "คุณมีเกมนี้อยู่แล้ว"
                    });
                }

                var cartItem = new CartItem
                {
                    UserId = userId,
                    GameId = gameId,
                    AddedAt = DateTime.UtcNow
                };

                _context.CartItems.Add(cartItem);
                await _context.SaveChangesAsync();

                return Ok(new KiroResponse
                {
                    Success = true,
                    Message = "เพิ่มลงตะกร้าสินค้าเรียบร้อยแล้ว"
                });
            }
            catch (Exception)
            {
                return StatusCode(500, new KiroResponse
                {
                    Success = false,
                    Message = "เกิดข้อผิดพลาดในการเพิ่มสินค้าลงตะกร้า"
                });
            }
        }

        [HttpDelete("{cartItemId}")]
        public async Task<ActionResult<KiroResponse>> RemoveFromCart(long cartItemId)
        {
            try
            {
                var userId = GetCurrentUserId();

                var cartItem = await _context.CartItems
                    .FirstOrDefaultAsync(ci => ci.Id == cartItemId && ci.UserId == userId);

                if (cartItem == null)
                {
                    return NotFound(new KiroResponse
                    {
                        Success = false,
                        Message = "ไม่พบสินค้าในตะกร้า"
                    });
                }

                _context.CartItems.Remove(cartItem);
                await _context.SaveChangesAsync();

                return Ok(new KiroResponse
                {
                    Success = true,
                    Message = "ลบสินค้าออกจากตะกร้าเรียบร้อยแล้ว"
                });
            }
            catch (Exception)
            {
                return StatusCode(500, new KiroResponse
                {
                    Success = false,
                    Message = "เกิดข้อผิดพลาดในการลบสินค้าออกจากตะกร้า"
                });
            }
        }

        [HttpDelete]
        public async Task<ActionResult<KiroResponse>> ClearCart()
        {
            try
            {
                var userId = GetCurrentUserId();

                var cartItems = await _context.CartItems
                    .Where(ci => ci.UserId == userId)
                    .ToListAsync();

                _context.CartItems.RemoveRange(cartItems);
                await _context.SaveChangesAsync();

                return Ok(new KiroResponse
                {
                    Success = true,
                    Message = "ล้างตะกร้าสินค้าเรียบร้อยแล้ว"
                });
            }
            catch (Exception)
            {
                return StatusCode(500, new KiroResponse
                {
                    Success = false,
                    Message = "เกิดข้อผิดพลาดในการล้างตะกร้าสินค้า"
                });
            }
        }

        [HttpGet("count")]
        public async Task<ActionResult<KiroResponse>> GetCartItemCount()
        {
            try
            {
                var userId = GetCurrentUserId();

                var count = await _context.CartItems
                    .CountAsync(ci => ci.UserId == userId);

                return Ok(new KiroResponse
                {
                    Success = true,
                    Data = count,
                    Message = "ดึงจำนวนสินค้าในตะกร้าสำเร็จ"
                });
            }
            catch (Exception)
            {
                return StatusCode(500, new KiroResponse
                {
                    Success = false,
                    Message = "เกิดข้อผิดพลาดในการดึงจำนวนสินค้าในตะกร้า"
                });
            }
        }

        [HttpGet("total")]
        public async Task<ActionResult<KiroResponse>> GetCartTotal()
        {
            try
            {
                var userId = GetCurrentUserId();

                var total = await _context.CartItems
                    .Include(ci => ci.Game)
                    .Where(ci => ci.UserId == userId)
                    .SumAsync(ci => ci.Game.Price);

                return Ok(new KiroResponse
                {
                    Success = true,
                    Data = total,
                    Message = "ดึงยอดรวมตะกร้าสินค้าสำเร็จ"
                });
            }
            catch (Exception)
            {
                return StatusCode(500, new KiroResponse
                {
                    Success = false,
                    Message = "เกิดข้อผิดพลาดในการดึงยอดรวมตะกร้าสินค้า"
                });
            }
        }
    }
}