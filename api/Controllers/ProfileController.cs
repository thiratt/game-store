using api.Helper;
using api.Models.Request;
using api.Models.Response;
using api.Models.Tables;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace api.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class ProfileController(KiroContext context) : ControllerBase
    {
        private readonly KiroContext _context = context;

        [HttpGet("{id:guid}")]
        public async Task<ActionResult> GetProfileById(Guid id)
        {
            var user = await _context.Accounts.FindAsync(id);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }
            return Ok(new KiroResponse
            {
                Success = true,
                Data = new
                {
                    user.Id,
                    user.Username,
                    user.Email,
                    user.ProfileImage,
                    user.Role,
                    user.CreatedAt
                }
            });
        }

        [HttpPut("{id:guid}")]
        public async Task<ActionResult> UpdateProfile(Guid id, [FromForm] UpdateProfileRequest request)
        {
            var user = await _context.Accounts.FindAsync(id);
            if (user == null)
            {
                return NotFound(new KiroResponse
                {
                    Success = false,
                    Message = "User not found"
                });
            }

            if (!string.IsNullOrWhiteSpace(request.Username))
            {
                var usernameExists = await _context.Accounts.AnyAsync(u => u.Username == request.Username && u.Id != id);
                if (usernameExists)
                {
                    return Conflict(new KiroResponse
                    {
                        Success = false,
                        Message = "Username is already taken"
                    });
                }
                user.Username = request.Username;
            }

            if (!string.IsNullOrWhiteSpace(request.Email))
            {
                var emailExists = await _context.Accounts.AnyAsync(u => u.Email == request.Email && u.Id != id);
                if (emailExists)
                {
                    return Conflict(new KiroResponse
                    {
                        Success = false,
                        Message = "Email is already taken"
                    });
                }
                user.Email = request.Email;
            }

            if (!string.IsNullOrWhiteSpace(request.Password))
            {
                user.PasswordHash = await Soenneker.Hashing.Argon2.Argon2HashingUtil.Hash(request.Password);
            }

            if (request.ProfileImage != null)
            {
                try
                {
                    if (!string.IsNullOrEmpty(user.ProfileImage))
                    {
                        var oldImageName = Path.GetFileName(user.ProfileImage.Replace("/image/", ""));
                        ImageHelper.Delete(oldImageName);
                    }

                    var imageUrl = await ImageHelper.SaveAsync(request.ProfileImage);
                    user.ProfileImage = imageUrl;
                }
                catch (Exception ex)
                {
                    return BadRequest(new KiroResponse
                    {
                        Success = false,
                        Message = $"Failed to upload profile image: {ex.Message}"
                    });
                }
            }

            user.UpdatedAt = DateTime.UtcNow;

            try
            {
                await _context.SaveChangesAsync();

                return Ok(new KiroResponse
                {
                    Success = true,
                    Message = "Profile updated successfully",
                    Data = new
                    {
                        user.Id,
                        user.Username,
                        user.Email,
                        user.ProfileImage,
                        user.Role,
                        user.UpdatedAt
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new KiroResponse
                {
                    Success = false,
                    Message = $"Failed to update profile: {ex.Message}"
                });
            }
        }
    }
}