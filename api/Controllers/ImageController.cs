using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using api.Helper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.StaticFiles;
//using api.Models;

namespace api.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class ImageController : ControllerBase
    {
        [HttpGet("{filename}")]
        public async Task<ActionResult<byte[]>> GetImageById(string filename)
        {
            if (string.IsNullOrEmpty(filename))
            {
                return BadRequest("Filename is null or empty.");
            }
            if (!Guid.TryParse(Path.GetFileNameWithoutExtension(filename), out _))
            {
                return BadRequest("Invalid filename format.");
            }

            var imageResponse = await ImageHelper.GetImageAsync(filename);

            if (imageResponse == null)
            {
                return NotFound("Image not found.");
            }

            var provider = new FileExtensionContentTypeProvider();
            if (!provider.TryGetContentType(filename, out string? contentType))
            {
                contentType = "application/octet-stream";
            }

            return File(imageResponse, contentType);
        }
    }
}