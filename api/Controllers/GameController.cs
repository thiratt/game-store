using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using api.Models.Dtos;
using api.Models.Response;
using api.Models.Tables;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace api.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class GameController(KiroContext context) : ControllerBase
    {
        private readonly KiroContext _context = context;

        [HttpGet]
        public async Task<ActionResult<KiroResponse>> Get()
        {
            var games = await _context.Games
                .Include(g => g.Categories)
                .ToListAsync();

            var gameDtos = games.Select(g => new GameDto
            {
                Id = g.Id,
                Title = g.Title,
                Description = g.Description,
                Price = g.Price,
                ReleaseDate = g.ReleaseDate,
                ImageUrl = g.ImageUrl,
                Categories = [.. g.Categories.Select(gc => new GameCategoryDto
                {
                    Id = gc.Id,
                    Name = gc.Name
                })],
            }).ToList();

            var response = new KiroResponse
            {
                Success = true,
                Data = gameDtos
            };
            return Ok(response);
        }

        [HttpGet("search")]
        public async Task<ActionResult<KiroResponse>> SearchGames([FromQuery] string q, [FromQuery] int? c)
        {
            var games = await _context.Games
                .Include(g => g.Categories)
                .Where(g => g.Title.Contains(q) && (!c.HasValue || g.Categories.Any(cat => cat.Id == c.Value)))
                .ToListAsync();

            var gameDtos = games.Select(g => new GameDto
            {
                Id = g.Id,
                Title = g.Title,
                Description = g.Description,
                Price = g.Price,
                ReleaseDate = g.ReleaseDate,
                ImageUrl = g.ImageUrl,
                Categories = [.. g.Categories.Select(gc => new GameCategoryDto
                {
                    Id = gc.Id,
                    Name = gc.Name
                })],
            }).ToList();

            var response = new KiroResponse
            {
                Success = true,
                Data = gameDtos
            };
            return Ok(response);
        }

        [HttpGet("latest")]
        public async Task<ActionResult<KiroResponse>> GetLatestGames()
        {
            var games = await _context.Games
                .Include(g => g.Categories)
                .OrderByDescending(g => g.ReleaseDate)
                .FirstOrDefaultAsync();

            if (games == null)
            {
                return NotFound(new KiroResponse
                {
                    Success = false,
                    Message = "No games found"
                });
            }
            var gameDto = new GameDto
            {
                Id = games.Id,
                Title = games.Title,
                Description = games.Description,
                Price = games.Price,
                ReleaseDate = games.ReleaseDate,
                ImageUrl = games.ImageUrl,
                Categories = [.. games.Categories.Select(gc => new GameCategoryDto
                {
                    Id = gc.Id,
                    Name = gc.Name
                })],
            };

            var response = new KiroResponse
            {
                Success = true,
                Data = gameDto
            };
            return Ok(response);
        }

        [HttpGet("random")]
        public async Task<ActionResult<KiroResponse>> GetRandomGame()
        {
            var count = await _context.Games.CountAsync();

            if (count == 0)
            {
                return NotFound(new KiroResponse
                {
                    Success = false,
                    Message = "No games found"
                });
            }

            var index = new Random().Next(0, count);

            var game = await _context.Games
                .Include(g => g.Categories)
                .Skip(index)
                .Take(1)
                .FirstOrDefaultAsync();

            if (game == null)
            {
                return NotFound(new KiroResponse
                {
                    Success = false,
                    Message = "No games found"
                });
            }

            var gameDto = new GameDto
            {
                Id = game.Id,
                Title = game.Title,
                Description = game.Description,
                Price = game.Price,
                ReleaseDate = game.ReleaseDate,
                ImageUrl = game.ImageUrl,
                Categories = [.. game.Categories.Select(gc => new GameCategoryDto
                {
                    Id = gc.Id,
                    Name = gc.Name
                })],
            };

            return Ok(new KiroResponse
            {
                Success = true,
                Data = gameDto
            });
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<KiroResponse>> GetGameById(Guid id)
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

            var gameDto = new GameDto
            {
                Id = game.Id,
                Title = game.Title,
                Description = game.Description,
                Price = game.Price,
                ReleaseDate = game.ReleaseDate,
                ImageUrl = game.ImageUrl,
                Categories = [.. game.Categories.Select(gc => new GameCategoryDto
                {
                    Id = gc.Id,
                    Name = gc.Name
                })]
            };

            return Ok(new KiroResponse
            {
                Success = true,
                Data = gameDto
            });
        }

        [HttpGet("categories")]
        public async Task<ActionResult<KiroResponse>> GetCategories()
        {
            var categories = await _context.Categories.ToListAsync();
            var categoryDtos = categories.Select(c => new GameCategoryDto
            {
                Id = c.Id,
                Name = c.Name
            }).ToList();
            var response = new KiroResponse
            {
                Success = true,
                Data = categoryDtos
            };
            return Ok(response);
        }
    }
}