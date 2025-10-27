namespace api.Models.Dtos
{
    public class TopSellerGameDto : GameDto
    {
        public int Rank { get; set; }
        public int SalesCount { get; set; }
    }
}