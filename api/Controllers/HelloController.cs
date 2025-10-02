using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class HelloController : ControllerBase
    {
        [HttpGet]
        public async Task<ActionResult<string>> GetStrings()
        {
            await Task.Delay(1);
            return Ok("Hello World!");
        }
    }
}