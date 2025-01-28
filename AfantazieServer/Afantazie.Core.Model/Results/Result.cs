using Afantazie.Core.Model.Results.Errors;

namespace Afantazie.Core.Model.Results
{
    /// <summary>
    /// A wrapper object for results of not-guaranteed-to-succeed operations.
    /// Basically a Maybe with either Success or an Error.
    /// </summary>
    public class Result
    {
        /// <summary>
        /// The error that occured during the operation.
        /// Can be accessed with null-forgiving operator if IsSuccess returns false.
        /// </summary>
        public Error? Error { get; init; } = null;

        public bool IsSuccess => Error is null;

        protected Result(Error error)
        {
            Error = error;
        }

        protected Result() { }


        // Factory methods

        public static Result Success() => new Result();

        public static Result<T_Value> Success<T_Value>(T_Value payload) => new Result<T_Value>(payload);

        public static Result Failure(Error error) => new Result(error);

        public static Result<T_Value> Failure<T_Value>(Error error) => new Result<T_Value>(error);


        // Conversion operators
        public static implicit operator Result(Error error) => new Result(error);
    }

    /// <summary>
    /// A wrapper object for results of not-guaranteed-to-succeed operations that may return a value.
    /// Basically a Maybe with either Return Value or an Error
    /// </summary>
    /// <typeparam name="T_Value">Type of the returned value.</typeparam>
    public class Result<T_Value>
    {
        /// <summary>
        /// The error that occured during the operation.
        /// Can be accessed with null-forgiving operator if IsSuccess returns false.
        /// </summary>
        public Error? Error { get; init; } = null;

        /// <summary>
        /// The value returned by the operation.
        /// Can be accessed with null-forgiving operator if IsSuccess returns true.
        /// </summary>
        public T_Value? Payload { get; init; } = default;

        public bool IsSuccess => Error is null;

        internal Result(T_Value payload)
        {
            Payload = payload;
        }

        internal Result(Error error)
        {
            Error = error;
        }

        // Conversion operators
        public static implicit operator Result<T_Value>(T_Value value) => new Result<T_Value>(value);

        public static implicit operator Result<T_Value>(Error error) => new Result<T_Value>(error);
    }
}
