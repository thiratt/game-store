using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using api.Helper;
using api.Models.Dtos;
using api.Models.Request;
using api.Models.Response;
using api.Models.Tables;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace api.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class AdminController(KiroContext context) : ControllerBase
    {
        private readonly KiroContext _context = context;

        [HttpPost("game")]
        public async Task<ActionResult<KiroResponse>> AddGame([FromBody] AddGameRequest request)
        {
            try
            {
                // Validate categories exist
                var existingCategories = await _context.Categories
                    .Where(c => request.CategoryIds.Contains(c.Id))
                    .ToListAsync();

                if (existingCategories.Count != request.CategoryIds.Count)
                {
                    return BadRequest(new KiroResponse
                    {
                        Success = false,
                        Message = "One or more categories do not exist"
                    });
                }

                // Create new game
                var game = new Game
                {
                    Id = Guid.NewGuid(),
                    Title = request.Title,
                    Description = request.Description,
                    Price = request.Price,
                    ReleaseDate = request.ReleaseDate,
                    ImageUrl = request.ImageUrl ?? string.Empty,
                    Categories = existingCategories
                };

                _context.Games.Add(game);
                await _context.SaveChangesAsync();

                // Return created game as DTO
                var gameDto = new GameDto
                {
                    Id = game.Id,
                    Title = game.Title,
                    Description = game.Description,
                    Price = game.Price,
                    ReleaseDate = game.ReleaseDate,
                    ImageUrl = game.ImageUrl,
                    Categories = [.. game.Categories.Select(c => new GameCategoryDto
                    {
                        Id = c.Id,
                        Name = c.Name
                    })]
                };

                var response = new KiroResponse
                {
                    Success = true,
                    Data = gameDto,
                    Message = "Game added successfully"
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new KiroResponse
                {
                    Success = false,
                    Message = $"Failed to add game: {ex.Message}"
                });
            }
        }

        [HttpDelete("game/{id}")]
        public async Task<ActionResult<KiroResponse>> DeleteGame(Guid id)
        {
            try
            {
                var game = await _context.Games
                    .Include(g => g.Categories)
                    .FirstOrDefaultAsync(g => g.Id == id);

                if (game == null)
                {
                    return NotFound(new KiroResponse
                    {
                        Success = false,
                        Message = "Game not found"
                    });
                }

                _context.Games.Remove(game);
                ImageHelper.Delete(game.ImageUrl.Replace("/image/", ""));
                await _context.SaveChangesAsync();

                return Ok(new KiroResponse
                {
                    Success = true,
                    Message = "Game deleted successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new KiroResponse
                {
                    Success = false,
                    Message = $"Failed to delete game: {ex.Message}"
                });
            }
        }
    }
}