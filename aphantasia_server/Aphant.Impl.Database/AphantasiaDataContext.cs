using Aphant.Impl.Database.Entity;
using Microsoft.EntityFrameworkCore;

namespace Aphant.Impl.Database;

public class AphantasiaDataContext : DbContext
{
    public AphantasiaDataContext(DbContextOptions<AphantasiaDataContext> options) : base(options) { }

    public DbSet<ThoughtEntity> Thoughts { get; set; }
    public DbSet<UserEntity> Users { get; set; }
    public DbSet<ConceptEntity> Concepts { get; set; }
    public DbSet<ThoughtReferenceEntity> ThoughtReferences { get; set; }
    public DbSet<ThoughtConceptEntity> ThoughtConcepts { get; set; }
    public DbSet<NotificationEntity> Notifications { get; set; }
    public DbSet<BookmarkEntity> Bookmarks { get; set; }
    public DbSet<UserFollowEntity> UserFollows { get; set; }
    public DbSet<ConceptFollowEntity> ConceptFollows { get; set; }
    public DbSet<EpochEntity> Epochs { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Thought
        modelBuilder.Entity<ThoughtEntity>().HasIndex(t => t.DateCreated);
        modelBuilder.Entity<ThoughtEntity>()
            .HasOne(t => t.Author)
            .WithMany(a => a.Thoughts)
            .HasForeignKey(t => t.AuthorId)
            .OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<ThoughtReferenceEntity>()
            .HasOne(tr => tr.SourceThought)
            .WithMany(t => t.Links)
            .HasForeignKey(tr => tr.SourceId)
            .OnDelete(DeleteBehavior.Cascade); // This assumes the graph is acyclic.
        modelBuilder.Entity<ThoughtReferenceEntity>()
            .HasOne(tr => tr.TargetThought)
            .WithMany(t => t.Backlinks)
            .HasForeignKey(tr => tr.TargetId)
            .OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<ThoughtEntity>()
            .HasMany(t => t.Concepts)
            .WithMany(c => c.Thoughts)
            .UsingEntity<ThoughtConceptEntity>(
                j => j
                    .HasOne(tc => tc.Concept)
                    .WithMany()
                    .HasForeignKey(tc => tc.ConceptTag)
                    .OnDelete(DeleteBehavior.Cascade),

                j => j
                    .HasOne(tc => tc.Thought)
                    .WithMany()
                    .OnDelete(DeleteBehavior.Cascade)
            );
        modelBuilder.Entity<ThoughtEntity>()
            .HasMany(t => t.Bookmarks)
            .WithOne(b => b.Thought)
            .OnDelete(DeleteBehavior.Cascade);

        // User
        modelBuilder.Entity<UserEntity>().HasIndex(t=> t.Email).IsUnique();
        modelBuilder.Entity<UserEntity>().HasIndex(t=> t.Username).IsUnique();
        modelBuilder.Entity<UserEntity>()
            .HasMany(u => u.Bookmarks)
            .WithOne(b => b.User)
            .OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<UserEntity>()
            .HasMany(u => u.FollowedConcepts)
            .WithMany(c => c.Followers)
            .UsingEntity<ConceptFollowEntity>(
                j => j.HasOne(cf => cf.Concept)
                    .WithMany()
                    .HasForeignKey(cf => cf.ConceptTag)
                    .OnDelete(DeleteBehavior.Cascade),
                j => j.HasOne(cf => cf.User)
                    .WithMany()
                    .OnDelete(DeleteBehavior.Cascade)
            );
        modelBuilder.Entity<UserEntity>()
            .HasMany(u => u.FollowedUsers)
            .WithMany(c => c.FollowerUsers)
            .UsingEntity<UserFollowEntity>(
                j => j.HasOne(cf => cf.Followed)
                    .WithMany()
                    .OnDelete(DeleteBehavior.Cascade),
                j => j.HasOne(cf => cf.Follower)
                    .WithMany()
                    .OnDelete(DeleteBehavior.Cascade)
            );

        // notifications
        modelBuilder.Entity<NotificationEntity>()
            .HasOne(n => n.User)
            .WithMany(u => u.Notifications)
            .HasForeignKey(n => n.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // epochs
        modelBuilder.Entity<EpochEntity>()
            .HasMany(e => e.Thoughts)
            .WithOne(t => t.Epoch)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
