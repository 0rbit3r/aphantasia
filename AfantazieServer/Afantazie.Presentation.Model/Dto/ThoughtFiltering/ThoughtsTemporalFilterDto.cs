namespace Afantazie.Presentation.Model.Dto.ThoughtFiltering
{
    public class ThoughtsTemporalFilterDto
    {
        public int? BeforeThoughtId { get; set; }
        
        public int? AfterThoughtId { get; set; }

        public int? AroundThoughtId { get; set; }

        public int Amount { get; set; }
    }
}