using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Aphant.Impl.Database.Migrations
{
    /// <inheritdoc />
    public partial class Notifications : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "type",
                table: "notifications");

            migrationBuilder.AddColumn<Guid>(
                name: "from_user_id",
                table: "notifications",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "ix_notifications_from_user_id",
                table: "notifications",
                column: "from_user_id");

            migrationBuilder.AddForeignKey(
                name: "fk_notifications_users_from_user_id",
                table: "notifications",
                column: "from_user_id",
                principalTable: "users",
                principalColumn: "id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_notifications_users_from_user_id",
                table: "notifications");

            migrationBuilder.DropIndex(
                name: "ix_notifications_from_user_id",
                table: "notifications");

            migrationBuilder.DropColumn(
                name: "from_user_id",
                table: "notifications");

            migrationBuilder.AddColumn<byte>(
                name: "type",
                table: "notifications",
                type: "smallint",
                nullable: false,
                defaultValue: (byte)0);
        }
    }
}
