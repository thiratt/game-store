using api.Helper;
using api.Models.Dtos;
using api.Models.Request;
using api.Models.Response;
using api.Models.Tables;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Soenneker.Hashing.Argon2;

namespace api.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class AuthController(KiroContext context) : ControllerBase
    {
        private readonly KiroContext _context = context;

        [HttpGet("check")]
        public async Task<ActionResult<KiroResponse>> CheckAvailabilityAsync([FromQuery] string type, [FromQuery] string value)
        {
            if (string.IsNullOrWhiteSpace(type) || string.IsNullOrWhiteSpace(value))
            {
                return BadRequest(new KiroResponse
                {
                    Success = false,
                    Message = "Type and value query parameters are required"
                });
            }

            try
            {
                bool isAvailable = type.ToLower() switch
                {
                    "username" => !await _context.Accounts.AnyAsync(u => u.Username == value),
                    "email" => !await _context.Accounts.AnyAsync(u => u.Email == value),
                    _ => throw new ArgumentException("Invalid type. Must be 'username' or 'email'.")
                };

                return Ok(new KiroResponse
                {
                    Success = isAvailable,
                    Message = isAvailable ? $"{type} is available" : $"{type} is already taken"
                });
            }
            catch (Exception)
            {
                return StatusCode(500, new KiroResponse
                {
                    Success = false,
                    Message = "An error occurred while checking availability"
                });
            }
        }

        [HttpPost("login")]
        public async Task<ActionResult<KiroResponse>> LoginAsync(LoginRequest model)
        {
            try
            {
                bool isEmailIdentifier = model.Identifier.Contains('@');
                Account? account = null;
                string errorMessage = $"{(isEmailIdentifier ? "อีเมล" : "ชื่อผู้ใช้งาน")}หรือรหัสผ่านไม่ถูกต้อง";

                if (isEmailIdentifier)
                {
                    account = await _context.Accounts
                        .FirstOrDefaultAsync(u => u.Email == model.Identifier);
                }
                else
                {
                    account = await _context.Accounts
                        .FirstOrDefaultAsync(u => u.Username == model.Identifier);
                }

                if (account == null)
                {
                    return Ok(new KiroResponse
                    {
                        Success = false,
                        Message = errorMessage
                    });
                }

                bool isPasswordValid = await Argon2HashingUtil.Verify(model.Password, account.PasswordHash);
                if (!isPasswordValid)
                {
                    return Ok(new KiroResponse
                    {
                        Success = false,
                        Message = errorMessage
                    });
                }

                return Ok(new KiroResponse
                {
                    Success = true,
                    Message = "เข้าสู่ระบบสำเร็จ",
                    Data = new UserInfo
                    {
                        Id = account.Id,
                        Username = account.Username,
                        Email = account.Email,
                        Role = account.Role,
                        ProfileImage = account.ProfileImage,
                        WalletBalance = account.WalletBalance
                    }
                });
            }
            catch (Exception)
            {
                return StatusCode(500, new KiroResponse
                {
                    Success = false,
                    Message = "An error occurred during login"
                });
            }
        }

        [HttpPost("signup")]
        public async Task<ActionResult<KiroResponse>> SignupAsync(SignupRequest model)
        {
            try
            {
                var existingUsername = await _context.Accounts
                    .FirstOrDefaultAsync(u => u.Username == model.Username);
                if (existingUsername != null)
                {
                    return Ok(new KiroResponse
                    {
                        Success = false,
                        Message = "Username already exists"
                    });
                }

                var existingEmail = await _context.Accounts
                    .FirstOrDefaultAsync(u => u.Email == model.Email);
                if (existingEmail != null)
                {
                    return Ok(new KiroResponse
                    {
                        Success = false,
                        Message = "Email already exists"
                    });
                }

                var passwordHash = await Argon2HashingUtil.Hash(model.Password);

                string? profileImageUrl = null;
                if (model.ProfileImage != null && model.ProfileImage.Length > 0)
                {
                    var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif" };
                    var fileExtension = Path.GetExtension(model.ProfileImage.FileName).ToLowerInvariant();

                    if (!allowedExtensions.Contains(fileExtension))
                    {
                        return Ok(new KiroResponse
                        {
                            Success = false,
                            Message = "Invalid file format. Only JPG, JPEG, PNG, and GIF are allowed."
                        });
                    }

                    if (model.ProfileImage.Length > 5 * 1024 * 1024)
                    {
                        return Ok(new KiroResponse
                        {
                            Success = false,
                            Message = "File size cannot exceed 5MB."
                        });
                    }

                    profileImageUrl = await ImageHelper.SaveAsync(model.ProfileImage);
                }

                var newAccount = new Account
                {
                    Id = Guid.NewGuid(),
                    Username = model.Username,
                    Email = model.Email,
                    PasswordHash = passwordHash,
                    Role = "USER",
                    ProfileImage = profileImageUrl,
                    WalletBalance = 0.00m,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.Accounts.Add(newAccount);
                await _context.SaveChangesAsync();

                return Ok(new KiroResponse
                {
                    Success = true,
                    Message = "Account created successfully",
                    Data = new UserInfo
                    {
                        Id = newAccount.Id,
                        Username = newAccount.Username,
                        Email = newAccount.Email,
                        Role = newAccount.Role,
                        ProfileImage = newAccount.ProfileImage,
                        WalletBalance = newAccount.WalletBalance
                    }
                });
            }
            catch (Exception)
            {
                return StatusCode(500, new KiroResponse
                {
                    Success = false,
                    Message = "An error occurred during signup"
                });
            }
        }
    }
}