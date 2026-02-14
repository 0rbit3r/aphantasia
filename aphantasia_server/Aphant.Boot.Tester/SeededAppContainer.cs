using System.Data.Common;
using Aphant.Core.Dto;
using Aphant.Impl.Database;
using Aphant.Impl.Database.Entity;
using Microsoft.Extensions.DependencyInjection;

public class SeededAppContainer<T> : AppContainer<T>
{
    public readonly Guid UserId1 = Guid.CreateVersion7();
    public readonly Guid UserId2 = Guid.CreateVersion7();
    public readonly Guid UserId3 = Guid.CreateVersion7();

    public readonly Guid ThoughtId1 = Guid.CreateVersion7();
    public readonly Guid ThoughtId2 = Guid.CreateVersion7();
    public readonly Guid ThoughtId3 = Guid.CreateVersion7();
    public SeededAppContainer() : base()
    {
        var db = Services.GetRequiredService<AphantasiaDataContext>();
        db.Users.Add(new UserEntity() { Id = UserId1, Username = "user1", PassHash = "---", Color = "#ffffff", Bio = "hello" });
        db.Users.Add(new UserEntity() { Id = UserId2, Username = "user2", PassHash = "---", Color = "#ffffff", Bio = "hello" });
        db.Users.Add(new UserEntity() { Id = UserId3, Username = "user3", PassHash = "---", Color = "#ffffff", Bio = "hello" });

        db.Thoughts.Add(new ThoughtEntity() { Id = ThoughtId1, AuthorId = UserId1, Color = "#ffffff", Content="", Title=nameof(ThoughtId1), DateCreated=DateTime.UtcNow});
        db.Thoughts.Add(new ThoughtEntity() { Id = ThoughtId2, AuthorId = UserId2, Color = "#ffffff", Content="", Title=nameof(ThoughtId2), DateCreated=DateTime.UtcNow});
        db.Thoughts.Add(new ThoughtEntity() { Id = ThoughtId3, AuthorId = UserId3, Color = "#ffffff", Content="", Title=nameof(ThoughtId3), DateCreated=DateTime.UtcNow});

        db.SaveChanges();

        db.ChangeTracker.Clear();
    }
}