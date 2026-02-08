namespace Aphant.Core.Dto.Results
{
    public class Error
    {
        private const string unspecifiedMsg = "unspecified";
        private Error(ErrorCode code, string? message = null) { Code = code; Message = message is null ? unspecifiedMsg : message; }
        public ErrorCode Code { get; set; }
        public string Message { get; set; }

        public override string ToString()
        {
            return $"{Code}: {Message}";
        }

        public Error AddMessage(string additionalMessage)
        {
            Message = $"{Message}\n{additionalMessage}".Trim();
            return this;
        }

        public static Error General(string? message = null) => new Error(ErrorCode.General, message);

        public static Error BadRequest(string? message = null) => new Error(ErrorCode.BadRequest, message);

        public static Error Unauthorized(string? message = null) => new Error(ErrorCode.Unauthorized, message);

        public static Error NotFound(string? message = null) => new Error(ErrorCode.NotFound, message);

        public static Error ExceptionThrown(Exception e) => new Error(ErrorCode.General, e.ToString());
    }
}
