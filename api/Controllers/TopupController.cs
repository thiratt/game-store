using System.Security.Claims;
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
    public class TopupController(KiroContext context) : ControllerBase
    {
        private readonly KiroContext _context = context;

        private Guid GetCurrentUserId()
        {
            bool isUserIdExists = Request.Headers.TryGetValue("X-User-ID", out var userIdHeader);
            if (!isUserIdExists || !Guid.TryParse(userIdHeader, out Guid userId))
            {
                throw new UnauthorizedAccessException("User ID is missing or invalid.");
            }

            return userId;
        }

        [HttpPost]
        public async Task<ActionResult<KiroResponse>> ProcessTopup([FromBody] TopupRequest request)
        {
            try
            {
                var userId = GetCurrentUserId();

                if (request.Amount <= 0)
                {
                    return BadRequest(new KiroResponse
                    {
                        Success = false,
                        Message = "จำนวนเงินต้องมากกว่า 0 บาท"
                    });
                }

                // if (request.Amount > 100000)
                // {
                //     return BadRequest(new KiroResponse
                //     {
                //         Success = false,
                //         Message = "จำนวนเงินต้องไม่เกิน 100,000 บาทต่อครั้ง"
                //     });
                // }

                var user = await _context.Accounts.FindAsync(userId);
                if (user == null)
                {
                    return NotFound(new KiroResponse
                    {
                        Success = false,
                        Message = "ไม่พบบัญชีผู้ใช้"
                    });
                }

                user.WalletBalance += request.Amount;
                user.UpdatedAt = DateTime.UtcNow;

                var transaction = new TransactionHistory
                {
                    UserId = userId,
                    Type = "TOPUP",
                    Amount = request.Amount,
                    ReferenceId = Guid.NewGuid(),
                    CreatedAt = DateTime.UtcNow
                };

                _context.TransactionHistories.Add(transaction);

                await _context.SaveChangesAsync();

                return Ok(new KiroResponse
                {
                    Success = true,
                    Message = $"เติมเงิน {request.Amount:N0} บาทเรียบร้อยแล้ว",
                    Data = new
                    {
                        Amount = request.Amount,
                        NewBalance = user.WalletBalance,
                        TransactionId = transaction.Id
                    }
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

        [HttpGet("history")]
        public async Task<ActionResult<KiroResponse>> GetTransactionHistory()
        {
            try
            {
                var userId = GetCurrentUserId();

                var transactions = await _context.TransactionHistories
                    .Where(t => t.UserId == userId)
                    .OrderByDescending(t => t.CreatedAt)
                    .Take(50) // Limit to last 50 transactions
                    .Select(t => new
                    {
                        t.Id,
                        t.Type,
                        t.Amount,
                        t.CreatedAt,
                        Description = t.Type == "TOPUP" ? "เติมเงินเข้ากระเป๋า" :
                                     t.Type == "PURCHASE" ? "ซื้อเกม" :
                                     t.Type == "REFUND" ? "คืนเงิน" : "รายการอื่นๆ"
                    })
                    .ToListAsync();

                return Ok(new KiroResponse
                {
                    Success = true,
                    Data = transactions
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

        [HttpGet("balance")]
        public async Task<ActionResult<KiroResponse>> GetWalletBalance()
        {
            try
            {
                var userId = GetCurrentUserId();

                var user = await _context.Accounts
                    .Where(u => u.Id == userId)
                    .Select(u => new { u.WalletBalance })
                    .FirstOrDefaultAsync();

                if (user == null)
                {
                    return NotFound(new KiroResponse
                    {
                        Success = false,
                        Message = "ไม่พบบัญชีผู้ใช้"
                    });
                }

                return Ok(new KiroResponse
                {
                    Success = true,
                    Data = new { Balance = user.WalletBalance }
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