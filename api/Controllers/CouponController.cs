using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using api.Models.Dtos;
using api.Models.Request;
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
                DiscountValue = c.DiscountValue,
                MaxUsage = c.MaxUsage,
                UsedCount = c.UsedCount,
                RemainingUsage = c.MaxUsage - c.UsedCount
            }).ToList();

            var response = new KiroResponse
            {
                Data = couponDtos,
                Message = "Coupons retrieved successfully",
                Success = true
            };
            return Ok(response);
        }

        [HttpPost]
        public async Task<ActionResult> AddCoupon([FromBody] AddCouponRequest request)
        {
            var existingCoupon = await _context.DiscountCodes
                .FirstOrDefaultAsync(c => c.Code == request.Code);

            if (existingCoupon != null)
            {
                var conflictResponse = new KiroResponse
                {
                    Data = null,
                    Message = "Coupon code already exists",
                    Success = false
                };
                return Conflict(conflictResponse);
            }

            var newCoupon = new DiscountCode
            {
                Id = Guid.NewGuid(),
                Code = request.Code,
                Description = request.Description,
                DiscountValue = request.DiscountValue,
                MaxUsage = request.MaxUsage,
                UsedCount = 0,
                CreatedAt = DateTime.UtcNow
            };

            _context.DiscountCodes.Add(newCoupon);
            await _context.SaveChangesAsync();

            var couponDto = new CouponDto
            {
                Id = newCoupon.Id,
                CreatedDate = newCoupon.CreatedAt,
                Code = newCoupon.Code,
                Description = newCoupon.Description,
                DiscountValue = newCoupon.DiscountValue,
                MaxUsage = newCoupon.MaxUsage,
                UsedCount = newCoupon.UsedCount,
                RemainingUsage = newCoupon.MaxUsage - newCoupon.UsedCount
            };

            var response = new KiroResponse
            {
                Data = couponDto,
                Message = "Coupon created successfully",
                Success = true
            };
            return CreatedAtAction(nameof(GetAllCoupons), response);
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