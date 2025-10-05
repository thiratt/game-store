using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using api.Models.Response;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers
{
    [Route("/")]
    [ApiController]
    public class HelloController : ControllerBase
    {
        [HttpGet]
        public ActionResult<KiroResponse> GetStrings()
        {
            var response = new KiroResponse
            {
                Success = true,
                Message = "Hello, World!",
                Data = new
                {
                    Ip = HttpContext.Connection.RemoteIpAddress?.ToString(),
                }
            };
            return Ok(response);
        }
    }
}