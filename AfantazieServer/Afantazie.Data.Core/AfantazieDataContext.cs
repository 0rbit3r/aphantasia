using Afantazie.Data.Model.Entity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;


public class AfantazieDataContext : DbContext
{
    public AfantazieDataContext(DbContextOptions<AfantazieDataContext> options) : base(options)
    {
    }

    public DbSet<UserEntity> Users { get; set; }

    public DbSet<ThoughtEntity> Thoughts { get; set; }

    public DbSet<ConceptEntity> Concepts { get; set; }

    public DbSet<ThoughtReferenceEntity> ThoughtReferences { get; set; }

    public DbSet<ThoughtConceptEntity> ThoughtConcepts { get; set; }

    public DbSet<NotificationEntity> Notifications { get; set; }


    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<UserEntity>().HasIndex(u => u.Email).IsUnique();
        modelBuilder.Entity<UserEntity>().HasIndex(u => u.Username).IsUnique();

        modelBuilder.Entity<ThoughtEntity>()
            .HasIndex(t => t.Title);

        // Configure outgoing links (SourceThought to TargetThought)
        modelBuilder.Entity<ThoughtReferenceEntity>()
            .HasOne(tr => tr.SourceThought)
            .WithMany(t => t.Links)
            .HasForeignKey(tr => tr.SourceId)
            .OnDelete(DeleteBehavior.Cascade);

        // Configure incoming links (TargetThought back to SourceThought)
        modelBuilder.Entity<ThoughtReferenceEntity>()
            .HasOne(tr => tr.TargetThought)
            .WithMany(t => t.Backlinks)
            .HasForeignKey(tr => tr.TargetId)
            .OnDelete(DeleteBehavior.Cascade);

        // Optional: Specify the join table name, if you prefer
        modelBuilder.Entity<ThoughtReferenceEntity>()
            .ToTable("ThoughtReferences");

        modelBuilder.Entity<ThoughtEntity>()
            .HasMany(t => t.Concepts)
            .WithMany(c => c.Thoughts)
            .UsingEntity<ThoughtConceptEntity>(
                j => j
                    .HasOne(tc => tc.Concept)
                    .WithMany()
                    .HasForeignKey(tc => tc.ConceptId)
                    .OnDelete(DeleteBehavior.Cascade),

                j => j
                    .HasOne(tc => tc.Thought)
                    .WithMany()
                    .HasForeignKey(tc => tc.ThoughtId)
                    .OnDelete(DeleteBehavior.Cascade)
            );

        modelBuilder.Entity<ThoughtConceptEntity>()
            .ToTable("ThoughtConcepts");

        modelBuilder.Entity<ConceptEntity>()
            .HasIndex(ConceptEntity => ConceptEntity.Tag);

        modelBuilder.Entity<NotificationEntity>()
            .HasOne(n => n.User)
            .WithMany(u => u.Notifications)
            .HasForeignKey(n => n.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<NotificationEntity>()
            .HasOne(n => n.Thought)
            .WithMany(t => t.Notifications)
            .HasForeignKey(n => n.ThoughtId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}