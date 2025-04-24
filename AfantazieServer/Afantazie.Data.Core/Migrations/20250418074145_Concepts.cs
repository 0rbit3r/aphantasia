using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Afantazie.Data.Model.Migrations
{
    /// <inheritdoc />
    public partial class Concepts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ThoughtReferences_Thoughts_SourceId",
                table: "ThoughtReferences");

            migrationBuilder.DropForeignKey(
                name: "FK_ThoughtReferences_Thoughts_TargetId",
                table: "ThoughtReferences");

            migrationBuilder.DropColumn(
                name: "MaxThoughts",
                table: "Users");

            migrationBuilder.AddColumn<string>(
                name: "Bio",
                table: "Users",
                type: "character varying(300)",
                maxLength: 300,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AlterColumn<string>(
                name: "Content",
                table: "Thoughts",
                type: "character varying(3000)",
                maxLength: 3000,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AddColumn<byte>(
                name: "Shape",
                table: "Thoughts",
                type: "smallint",
                nullable: false,
                defaultValue: (byte)0);

            migrationBuilder.CreateTable(
                name: "Concepts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Tag = table.Column<string>(type: "text", nullable: false),
                    Color = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Concepts", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ThoughtConcepts",
                columns: table => new
                {
                    ThoughtId = table.Column<int>(type: "integer", nullable: false),
                    ConceptId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ThoughtConcepts", x => new { x.ThoughtId, x.ConceptId });
                    table.ForeignKey(
                        name: "FK_ThoughtConcepts_Concepts_ConceptId",
                        column: x => x.ConceptId,
                        principalTable: "Concepts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ThoughtConcepts_Thoughts_ThoughtId",
                        column: x => x.ThoughtId,
                        principalTable: "Thoughts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Concepts_Tag",
                table: "Concepts",
                column: "Tag");

            migrationBuilder.CreateIndex(
                name: "IX_ThoughtConcepts_ConceptId",
                table: "ThoughtConcepts",
                column: "ConceptId");

            migrationBuilder.AddForeignKey(
                name: "FK_ThoughtReferences_Thoughts_SourceId",
                table: "ThoughtReferences",
                column: "SourceId",
                principalTable: "Thoughts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ThoughtReferences_Thoughts_TargetId",
                table: "ThoughtReferences",
                column: "TargetId",
                principalTable: "Thoughts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ThoughtReferences_Thoughts_SourceId",
                table: "ThoughtReferences");

            migrationBuilder.DropForeignKey(
                name: "FK_ThoughtReferences_Thoughts_TargetId",
                table: "ThoughtReferences");

            migrationBuilder.DropTable(
                name: "ThoughtConcepts");

            migrationBuilder.DropTable(
                name: "Concepts");

            migrationBuilder.DropColumn(
                name: "Bio",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "Shape",
                table: "Thoughts");

            migrationBuilder.AddColumn<int>(
                name: "MaxThoughts",
                table: "Users",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AlterColumn<string>(
                name: "Content",
                table: "Thoughts",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(3000)",
                oldMaxLength: 3000);

            migrationBuilder.AddForeignKey(
                name: "FK_ThoughtReferences_Thoughts_SourceId",
                table: "ThoughtReferences",
                column: "SourceId",
                principalTable: "Thoughts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ThoughtReferences_Thoughts_TargetId",
                table: "ThoughtReferences",
                column: "TargetId",
                principalTable: "Thoughts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
