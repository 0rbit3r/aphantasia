using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Afantazie.Data.Model.Migrations
{
    /// <inheritdoc />
    public partial class cascadeDeleteNotificationThought : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Notifications_Thoughts_ThoughtId",
                table: "Notifications");

            migrationBuilder.AddForeignKey(
                name: "FK_Notifications_Thoughts_ThoughtId",
                table: "Notifications",
                column: "ThoughtId",
                principalTable: "Thoughts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Notifications_Thoughts_ThoughtId",
                table: "Notifications");

            migrationBuilder.AddForeignKey(
                name: "FK_Notifications_Thoughts_ThoughtId",
                table: "Notifications",
                column: "ThoughtId",
                principalTable: "Thoughts",
                principalColumn: "Id");
        }
    }
}
