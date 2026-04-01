using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

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
                name: "concepts",
                columns: table => new
                {
                    tag = table.Column<string>(type: "text", nullable: false),
                    color = table.Column<string>(type: "text", nullable: false),
                    date_created = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_concepts", x => x.tag);
                });

            migrationBuilder.CreateTable(
                name: "epochs",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    start_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    end_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    name = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_epochs", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "users",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    email = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    username = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    pass_hash = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    color = table.Column<string>(type: "character varying(7)", maxLength: 7, nullable: false),
                    bio = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    date_joined = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_users", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "concept_follows",
                columns: table => new
                {
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    concept_tag = table.Column<string>(type: "text", nullable: false),
                    minimum_replies = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_concept_follows", x => new { x.user_id, x.concept_tag });
                    table.ForeignKey(
                        name: "fk_concept_follows_concepts_concept_tag",
                        column: x => x.concept_tag,
                        principalTable: "concepts",
                        principalColumn: "tag",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_concept_follows_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "thoughts",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    title = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    color = table.Column<string>(type: "character varying(7)", maxLength: 7, nullable: false),
                    date_created = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    author_id = table.Column<Guid>(type: "uuid", nullable: false),
                    size_multiplier = table.Column<int>(type: "integer", nullable: false),
                    shape = table.Column<int>(type: "integer", nullable: false),
                    position_x = table.Column<double>(type: "double precision", nullable: false),
                    position_y = table.Column<double>(type: "double precision", nullable: false),
                    content = table.Column<string>(type: "character varying(3000)", maxLength: 3000, nullable: false),
                    epoch_id = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_thoughts", x => x.id);
                    table.ForeignKey(
                        name: "fk_thoughts_epochs_epoch_id",
                        column: x => x.epoch_id,
                        principalTable: "epochs",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "fk_thoughts_users_author_id",
                        column: x => x.author_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "user_follows",
                columns: table => new
                {
                    follower_id = table.Column<Guid>(type: "uuid", nullable: false),
                    followed_id = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_user_follows", x => new { x.followed_id, x.follower_id });
                    table.ForeignKey(
                        name: "fk_user_follows_users_followed_id",
                        column: x => x.followed_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_user_follows_users_follower_id",
                        column: x => x.follower_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "bookmarks",
                columns: table => new
                {
                    thought_id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_bookmarks", x => new { x.thought_id, x.user_id });
                    table.ForeignKey(
                        name: "fk_bookmarks_thoughts_thought_id",
                        column: x => x.thought_id,
                        principalTable: "thoughts",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_bookmarks_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "notifications",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    thought_id = table.Column<Guid>(type: "uuid", nullable: true),
                    text = table.Column<string>(type: "text", nullable: true),
                    type = table.Column<byte>(type: "smallint", nullable: false),
                    is_read = table.Column<bool>(type: "boolean", nullable: false),
                    date_created = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_notifications", x => x.id);
                    table.ForeignKey(
                        name: "fk_notifications_thoughts_thought_id",
                        column: x => x.thought_id,
                        principalTable: "thoughts",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "fk_notifications_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "thought_concepts",
                columns: table => new
                {
                    thought_id = table.Column<Guid>(type: "uuid", nullable: false),
                    concept_tag = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_thought_concepts", x => new { x.thought_id, x.concept_tag });
                    table.ForeignKey(
                        name: "fk_thought_concepts_concepts_concept_tag",
                        column: x => x.concept_tag,
                        principalTable: "concepts",
                        principalColumn: "tag",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_thought_concepts_thoughts_thought_id",
                        column: x => x.thought_id,
                        principalTable: "thoughts",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "thought_references",
                columns: table => new
                {
                    source_id = table.Column<Guid>(type: "uuid", nullable: false),
                    target_id = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_thought_references", x => new { x.source_id, x.target_id });
                    table.ForeignKey(
                        name: "fk_thought_references_thoughts_source_id",
                        column: x => x.source_id,
                        principalTable: "thoughts",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_thought_references_thoughts_target_id",
                        column: x => x.target_id,
                        principalTable: "thoughts",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_bookmarks_user_id",
                table: "bookmarks",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "ix_concept_follows_concept_tag",
                table: "concept_follows",
                column: "concept_tag");

            migrationBuilder.CreateIndex(
                name: "ix_notifications_thought_id",
                table: "notifications",
                column: "thought_id");

            migrationBuilder.CreateIndex(
                name: "ix_notifications_user_id",
                table: "notifications",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "ix_thought_concepts_concept_tag",
                table: "thought_concepts",
                column: "concept_tag");

            migrationBuilder.CreateIndex(
                name: "ix_thought_references_target_id",
                table: "thought_references",
                column: "target_id");

            migrationBuilder.CreateIndex(
                name: "ix_thoughts_author_id",
                table: "thoughts",
                column: "author_id");

            migrationBuilder.CreateIndex(
                name: "ix_thoughts_date_created",
                table: "thoughts",
                column: "date_created");

            migrationBuilder.CreateIndex(
                name: "ix_thoughts_epoch_id",
                table: "thoughts",
                column: "epoch_id");

            migrationBuilder.CreateIndex(
                name: "ix_user_follows_follower_id",
                table: "user_follows",
                column: "follower_id");

            migrationBuilder.CreateIndex(
                name: "ix_users_email",
                table: "users",
                column: "email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_users_username",
                table: "users",
                column: "username",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "bookmarks");

            migrationBuilder.DropTable(
                name: "concept_follows");

            migrationBuilder.DropTable(
                name: "notifications");

            migrationBuilder.DropTable(
                name: "thought_concepts");

            migrationBuilder.DropTable(
                name: "thought_references");

            migrationBuilder.DropTable(
                name: "user_follows");

            migrationBuilder.DropTable(
                name: "concepts");

            migrationBuilder.DropTable(
                name: "thoughts");

            migrationBuilder.DropTable(
                name: "epochs");

            migrationBuilder.DropTable(
                name: "users");
        }
    }
}
