using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Afantazie.Data.Model.Migrations
{
    /// <inheritdoc />
    public partial class AddedPosition : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "PositionX",
                table: "Thoughts",
                type: "double precision",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "PositionY",
                table: "Thoughts",
                type: "double precision",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PositionX",
                table: "Thoughts");

            migrationBuilder.DropColumn(
                name: "PositionY",
                table: "Thoughts");
        }
    }
}
