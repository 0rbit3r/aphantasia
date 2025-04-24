using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Afantazie.Data.Model.Migrations
{
    /// <inheritdoc />
    public partial class pinned : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "Pinned",
                table: "Thoughts",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Pinned",
                table: "Thoughts");
        }
    }
}
