using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using api.Models.Dtos;
using api.Models.Response;
using api.Models.Tables;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Internal;

namespace api.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class UserController(KiroContext context) : ControllerBase
    {
        private readonly KiroContext _context = context;

        [HttpGet("all")]
        public async Task<ActionResult<KiroResponse>> GetAllUsersAsync()
        {
            var users = await _context.Accounts
            .Where(u => u.Role != "admin")
            .OrderBy(u => u.Username)
            .Include(u => u.TransactionHistories)
            .ToListAsync();

            var userDtos = users.Select(u => new
            {
                Id = u.Id,
                Email = u.Email,
                Username = u.Username,
                WalletBalance = u.WalletBalance,
                Role = u.Role,
                ProfileImage = u.ProfileImage,
                TransactionHistories = u.TransactionHistories.Select(th => new
                {
                    Id = th.ReferenceId,
                    Amount = th.Amount,
                    Type = th.Type,
                    TransactionDate = th.CreatedAt,
                    Description = th.Type == "TOPUP" ? "เติมเงินเข้ากระเป๋า"
                                : th.Type == "PURCHASE" ? "ซื้อเกม"
                                : th.Type == "REFUND" ? "คืนเงิน"
                                : "รายการอื่นๆ"
                }).ToList()
            }).ToList();

            var response = new KiroResponse
            {
                Success = true,
                Data = userDtos
            };
            return Ok(response);
        }
    }
}