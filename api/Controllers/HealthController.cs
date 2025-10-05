using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using api.Models.Tables;
using api.Models.Response;

namespace api.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class HealthController(KiroContext context, ILogger<HealthController> logger) : ControllerBase
    {
        private readonly KiroContext _context = context;
        private readonly ILogger<HealthController> _logger = logger;

        [HttpGet]
        public async Task<ActionResult<KiroResponse>> GetHealth()
        {
            var healthChecks = new Dictionary<string, object>();

            try
            {
                var dbHealthy = await _context.Database.CanConnectAsync();
                healthChecks["database"] = new { status = dbHealthy ? "healthy" : "unhealthy" };

                var uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "uploads");
                var uploadsHealthy = Directory.Exists(uploadsPath);
                healthChecks["uploads_directory"] = new
                {
                    status = uploadsHealthy ? "healthy" : "unhealthy",
                    path = uploadsPath
                };

                var overallHealthy = dbHealthy && uploadsHealthy;

                return Ok(new KiroResponse
                {
                    Success = overallHealthy,
                    Message = overallHealthy ? "All systems operational" : "Some systems are not healthy",
                    Data = new
                    {
                        status = overallHealthy ? "healthy" : "degraded",
                        timestamp = DateTime.UtcNow,
                        // version = "1.0.0",
                        checks = healthChecks
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Health check failed");

                return StatusCode(503, new KiroResponse
                {
                    Success = false,
                    Message = "Health check failed",
                    Data = new
                    {
                        status = "unhealthy",
                        timestamp = DateTime.UtcNow,
                        error = ex.Message
                    }
                });
            }
        }

        [HttpGet("ready")]
        public async Task<IActionResult> GetReadiness()
        {
            try
            {
                var canConnect = await _context.Database.CanConnectAsync();

                if (canConnect)
                {
                    return Ok(new { status = "ready", timestamp = DateTime.UtcNow });
                }
                else
                {
                    return StatusCode(503, new { status = "not ready", timestamp = DateTime.UtcNow });
                }
            }
            catch
            {
                return StatusCode(503, new { status = "not ready", timestamp = DateTime.UtcNow });
            }
        }
    }
}