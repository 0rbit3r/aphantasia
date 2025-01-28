namespace Afantazie.Presentation.Model.Dto.Auth
{
    public class RegisterRequestDto
    {
        public required string Username { get; set; }

        public required string Email { get; set; }

        public required string Password { get; set; }
    }
}
