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

    public DbSet<ThoughtReferenceEntity> ThoughtReferences { get; set; }

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
            .OnDelete(DeleteBehavior.Restrict); // Prevent cascade delete loops

        // Configure incoming links (TargetThought back to SourceThought)
        modelBuilder.Entity<ThoughtReferenceEntity>()
            .HasOne(tr => tr.TargetThought)
            .WithMany(t => t.Backlinks)
            .HasForeignKey(tr => tr.TargetId)
            .OnDelete(DeleteBehavior.Restrict); // Prevent cascade delete loops

        // Optional: Specify the join table name, if you prefer
        modelBuilder.Entity<ThoughtReferenceEntity>()
            .ToTable("ThoughtReferences");
    }
}