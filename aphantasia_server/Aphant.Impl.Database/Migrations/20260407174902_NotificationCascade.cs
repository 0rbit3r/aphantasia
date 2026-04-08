using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Aphant.Impl.Database.Migrations
{
    /// <inheritdoc />
    public partial class NotificationCascade : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_notifications_thoughts_thought_id",
                table: "notifications");

            migrationBuilder.AddForeignKey(
                name: "fk_notifications_thoughts_thought_id",
                table: "notifications",
                column: "thought_id",
                principalTable: "thoughts",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_notifications_thoughts_thought_id",
                table: "notifications");

            migrationBuilder.AddForeignKey(
                name: "fk_notifications_thoughts_thought_id",
                table: "notifications",
                column: "thought_id",
                principalTable: "thoughts",
                principalColumn: "id");
        }
    }
}
