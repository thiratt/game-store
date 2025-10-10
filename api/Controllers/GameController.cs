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