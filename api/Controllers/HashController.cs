using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
//using api.Models;

namespace api.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class HashController : ControllerBase
    {
        [HttpGet]
        public async Task<ActionResult<string>> GetHash([FromQuery] string password)
        {
            var hash = await Soenneker.Hashing.Argon2.Argon2HashingUtil.Hash(password);
            return Ok(hash);
        }
    }
}