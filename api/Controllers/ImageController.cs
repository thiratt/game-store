using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using api.Helper;
using api.Models.Response;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.StaticFiles;

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

        [HttpPost("upload")]
        public async Task<ActionResult<KiroResponse>> UploadImage([FromForm] IFormFile image)
        {
            try
            {
                if (image == null || image.Length == 0)
                {
                    return BadRequest(new KiroResponse
                    {
                        Success = false,
                        Message = "No image provided"
                    });
                }

                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
                var fileExtension = Path.GetExtension(image.FileName).ToLowerInvariant();

                if (!allowedExtensions.Contains(fileExtension))
                {
                    return BadRequest(new KiroResponse
                    {
                        Success = false,
                        Message = "Invalid file type. Only JPG, JPEG, PNG, GIF, and WebP files are allowed."
                    });
                }

                if (image.Length > 5 * 1024 * 1024)
                {
                    return BadRequest(new KiroResponse
                    {
                        Success = false,
                        Message = "File size exceeds 5MB limit"
                    });
                }

                var imageUrl = await ImageHelper.SaveAsync(image);

                return Ok(new KiroResponse
                {
                    Success = true,
                    Data = imageUrl,
                    Message = "Image uploaded successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new KiroResponse
                {
                    Success = false,
                    Message = $"Failed to upload image: {ex.Message}"
                });
            }
        }

        [HttpDelete("{filename}")]
        public ActionResult<KiroResponse> DeleteImage(string filename)
        {
            try
            {
                if (string.IsNullOrEmpty(filename))
                {
                    return BadRequest(new KiroResponse
                    {
                        Success = false,
                        Message = "Filename is required"
                    });
                }

                var actualFilename = filename;
                if (filename.StartsWith("/image/"))
                {
                    actualFilename = filename[7..]; // Remove "/image/" prefix
                }

                var deleted = ImageHelper.Delete(actualFilename);

                if (deleted)
                {
                    return Ok(new KiroResponse
                    {
                        Success = true,
                        Message = "Image deleted successfully"
                    });
                }
                else
                {
                    return NotFound(new KiroResponse
                    {
                        Success = false,
                        Message = "Image not found or could not be deleted"
                    });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new KiroResponse
                {
                    Success = false,
                    Message = $"Failed to delete image: {ex.Message}"
                });
            }
        }
    }
}