using api.Models.Response;
using api.Models.Tables;
using Microsoft.AspNetCore.Mvc;

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

    }
}