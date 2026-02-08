using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Aphant.Impl.Database.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Concepts",
                columns: table => new
                {
                    Tag = table.Column<string>(type: "text", nullable: false),
                    Color = table.Column<string>(type: "text", nullable: false),
                    DateCreated = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Concepts", x => x.Tag);
                });

            migrationBuilder.CreateTable(
                name: "Epochs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Epochs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Email = table.Column<string>(type: "text", nullable: true),
                    Username = table.Column<string>(type: "text", nullable: false),
                    Password = table.Column<string>(type: "text", nullable: false),
                    Color = table.Column<string>(type: "text", nullable: false),
                    Bio = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ConceptFollows",
                columns: table => new
                {
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    ConceptTag = table.Column<string>(type: "text", nullable: false),
                    MinimumReplies = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ConceptFollows", x => new { x.UserId, x.ConceptTag });
                    table.ForeignKey(
                        name: "FK_ConceptFollows_Concepts_ConceptTag",
                        column: x => x.ConceptTag,
                        principalTable: "Concepts",
                        principalColumn: "Tag",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ConceptFollows_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Thoughts",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: false),
                    DateCreated = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AuthorId = table.Column<Guid>(type: "uuid", nullable: false),
                    SizeMultiplier = table.Column<int>(type: "integer", nullable: false),
                    Shape = table.Column<byte>(type: "smallint", nullable: false),
                    PositionX = table.Column<double>(type: "double precision", nullable: false),
                    PositionY = table.Column<double>(type: "double precision", nullable: false),
                    Content = table.Column<string>(type: "character varying(3000)", maxLength: 3000, nullable: false),
                    EpochId = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Thoughts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Thoughts_Epochs_EpochId",
                        column: x => x.EpochId,
                        principalTable: "Epochs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Thoughts_Users_AuthorId",
                        column: x => x.AuthorId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserFollows",
                columns: table => new
                {
                    FollowerId = table.Column<Guid>(type: "uuid", nullable: false),
                    FollowedId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserFollows", x => new { x.FollowedId, x.FollowerId });
                    table.ForeignKey(
                        name: "FK_UserFollows_Users_FollowedId",
                        column: x => x.FollowedId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserFollows_Users_FollowerId",
                        column: x => x.FollowerId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Bookmarks",
                columns: table => new
                {
                    ThoughtId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Bookmarks", x => new { x.ThoughtId, x.UserId });
                    table.ForeignKey(
                        name: "FK_Bookmarks_Thoughts_ThoughtId",
                        column: x => x.ThoughtId,
                        principalTable: "Thoughts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Bookmarks_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Notifications",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    ThoughtId = table.Column<Guid>(type: "uuid", nullable: true),
                    Text = table.Column<string>(type: "text", nullable: true),
                    Type = table.Column<byte>(type: "smallint", nullable: false),
                    IsRead = table.Column<bool>(type: "boolean", nullable: false),
                    DateCreated = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Notifications", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Notifications_Thoughts_ThoughtId",
                        column: x => x.ThoughtId,
                        principalTable: "Thoughts",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Notifications_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ThoughtConcepts",
                columns: table => new
                {
                    ThoughtId = table.Column<Guid>(type: "uuid", nullable: false),
                    ConceptTag = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ThoughtConcepts", x => new { x.ThoughtId, x.ConceptTag });
                    table.ForeignKey(
                        name: "FK_ThoughtConcepts_Concepts_ConceptTag",
                        column: x => x.ConceptTag,
                        principalTable: "Concepts",
                        principalColumn: "Tag",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ThoughtConcepts_Thoughts_ThoughtId",
                        column: x => x.ThoughtId,
                        principalTable: "Thoughts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ThoughtReferences",
                columns: table => new
                {
                    SourceId = table.Column<Guid>(type: "uuid", nullable: false),
                    TargetId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ThoughtReferences", x => new { x.SourceId, x.TargetId });
                    table.ForeignKey(
                        name: "FK_ThoughtReferences_Thoughts_SourceId",
                        column: x => x.SourceId,
                        principalTable: "Thoughts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ThoughtReferences_Thoughts_TargetId",
                        column: x => x.TargetId,
                        principalTable: "Thoughts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Bookmarks_UserId",
                table: "Bookmarks",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_ConceptFollows_ConceptTag",
                table: "ConceptFollows",
                column: "ConceptTag");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_ThoughtId",
                table: "Notifications",
                column: "ThoughtId");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_UserId",
                table: "Notifications",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_ThoughtConcepts_ConceptTag",
                table: "ThoughtConcepts",
                column: "ConceptTag");

            migrationBuilder.CreateIndex(
                name: "IX_ThoughtReferences_TargetId",
                table: "ThoughtReferences",
                column: "TargetId");

            migrationBuilder.CreateIndex(
                name: "IX_Thoughts_AuthorId",
                table: "Thoughts",
                column: "AuthorId");

            migrationBuilder.CreateIndex(
                name: "IX_Thoughts_DateCreated",
                table: "Thoughts",
                column: "DateCreated");

            migrationBuilder.CreateIndex(
                name: "IX_Thoughts_EpochId",
                table: "Thoughts",
                column: "EpochId");

            migrationBuilder.CreateIndex(
                name: "IX_UserFollows_FollowerId",
                table: "UserFollows",
                column: "FollowerId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Bookmarks");

            migrationBuilder.DropTable(
                name: "ConceptFollows");

            migrationBuilder.DropTable(
                name: "Notifications");

            migrationBuilder.DropTable(
                name: "ThoughtConcepts");

            migrationBuilder.DropTable(
                name: "ThoughtReferences");

            migrationBuilder.DropTable(
                name: "UserFollows");

            migrationBuilder.DropTable(
                name: "Concepts");

            migrationBuilder.DropTable(
                name: "Thoughts");

            migrationBuilder.DropTable(
                name: "Epochs");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
