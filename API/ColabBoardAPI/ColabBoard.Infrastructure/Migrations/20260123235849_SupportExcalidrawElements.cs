using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace ColabBoard.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class SupportExcalidrawElements : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "StrokePoints");

            migrationBuilder.DropColumn(
                name: "Size",
                table: "Strokes");

            migrationBuilder.RenameColumn(
                name: "Color",
                table: "Strokes",
                newName: "ElementId");

            migrationBuilder.AddColumn<string>(
                name: "ElementAttributes",
                table: "Strokes",
                type: "jsonb",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ElementAttributes",
                table: "Strokes");

            migrationBuilder.RenameColumn(
                name: "ElementId",
                table: "Strokes",
                newName: "Color");

            migrationBuilder.AddColumn<int>(
                name: "Size",
                table: "Strokes",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "StrokePoints",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Order = table.Column<int>(type: "integer", nullable: false),
                    StrokeId = table.Column<Guid>(type: "uuid", nullable: false),
                    x = table.Column<decimal>(type: "numeric", nullable: false),
                    y = table.Column<decimal>(type: "numeric", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StrokePoints", x => x.Id);
                    table.ForeignKey(
                        name: "FK_StrokePoints_Strokes_StrokeId",
                        column: x => x.StrokeId,
                        principalTable: "Strokes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_StrokePoints_StrokeId_Order",
                table: "StrokePoints",
                columns: new[] { "StrokeId", "Order" });
        }
    }
}
