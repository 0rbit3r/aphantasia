using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Aphant.Impl.Database.Migrations
{
    /// <inheritdoc />
    public partial class EpochNavigationAndBioLength : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_chat_messages_chat_messages_parent_id",
                table: "chat_messages");

            migrationBuilder.AlterColumn<string>(
                name: "bio",
                table: "users",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(300)",
                oldMaxLength: 300);

            migrationBuilder.AddColumn<int>(
                name: "next_epoch_id",
                table: "epochs",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "previous_epoch_id",
                table: "epochs",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "ix_epochs_next_epoch_id",
                table: "epochs",
                column: "next_epoch_id");

            migrationBuilder.CreateIndex(
                name: "ix_epochs_previous_epoch_id",
                table: "epochs",
                column: "previous_epoch_id");

            migrationBuilder.AddForeignKey(
                name: "fk_chat_messages_chat_messages_parent_id",
                table: "chat_messages",
                column: "parent_id",
                principalTable: "chat_messages",
                principalColumn: "id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "fk_epochs_epochs_next_epoch_id",
                table: "epochs",
                column: "next_epoch_id",
                principalTable: "epochs",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "fk_epochs_epochs_previous_epoch_id",
                table: "epochs",
                column: "previous_epoch_id",
                principalTable: "epochs",
                principalColumn: "id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_chat_messages_chat_messages_parent_id",
                table: "chat_messages");

            migrationBuilder.DropForeignKey(
                name: "fk_epochs_epochs_next_epoch_id",
                table: "epochs");

            migrationBuilder.DropForeignKey(
                name: "fk_epochs_epochs_previous_epoch_id",
                table: "epochs");

            migrationBuilder.DropIndex(
                name: "ix_epochs_next_epoch_id",
                table: "epochs");

            migrationBuilder.DropIndex(
                name: "ix_epochs_previous_epoch_id",
                table: "epochs");

            migrationBuilder.DropColumn(
                name: "next_epoch_id",
                table: "epochs");

            migrationBuilder.DropColumn(
                name: "previous_epoch_id",
                table: "epochs");

            migrationBuilder.AlterColumn<string>(
                name: "bio",
                table: "users",
                type: "character varying(300)",
                maxLength: 300,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(1000)",
                oldMaxLength: 1000);

            migrationBuilder.AddForeignKey(
                name: "fk_chat_messages_chat_messages_parent_id",
                table: "chat_messages",
                column: "parent_id",
                principalTable: "chat_messages",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
