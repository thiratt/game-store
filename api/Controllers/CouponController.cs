using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using api.Models.Dtos;
using api.Models.Response;
using api.Models.Tables;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
//using api.Models;

namespace api.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class CouponController(KiroContext context) : ControllerBase
    {
        private readonly KiroContext _context = context;

        [HttpGet]
        public async Task<ActionResult> GetAllCoupons()
        {
            var coupons = await _context.DiscountCodes.ToListAsync();

            var couponDtos = coupons.Select(c => new CouponDto
            {
                Id = c.Id,
                CreatedDate = c.CreatedAt,
                Code = c.Code,
                Description = c.Description,
                TotalAmount = c.MaxUsage,
                UsedAmount = c.UsedCount,
                RemainingAmount = c.MaxUsage - c.UsedCount
            }).ToList();

            var response = new KiroResponse
            {
                Data = couponDtos,
                Message = "Coupons retrieved successfully",
                Success = true
            };
            return Ok(response);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteCoupon(Guid id)
        {
            var coupon = await _context.DiscountCodes.FindAsync(id);

            if (coupon == null)
            {
                var notFoundResponse = new KiroResponse
                {
                    Data = null,
                    Message = "Coupon not found",
                    Success = false
                };
                return NotFound(notFoundResponse);
            }

            _context.DiscountCodes.Remove(coupon);
            await _context.SaveChangesAsync();

            var response = new KiroResponse
            {
                Data = null,
                Message = "Coupon deleted successfully",
                Success = true
            };
            return Ok(response);
        }
    }
}