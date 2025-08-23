using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace ColabBoard.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class point : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Point");

            migrationBuilder.CreateTable(
                name: "StrokePoints",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Order = table.Column<int>(type: "integer", nullable: false),
                    x = table.Column<decimal>(type: "numeric", nullable: false),
                    y = table.Column<decimal>(type: "numeric", nullable: false),
                    StrokeId = table.Column<Guid>(type: "uuid", nullable: false)
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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "StrokePoints");

            migrationBuilder.CreateTable(
                name: "Point",
                columns: table => new
                {
                    StrokeId = table.Column<Guid>(type: "uuid", nullable: false),
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    x = table.Column<decimal>(type: "numeric", nullable: false),
                    y = table.Column<decimal>(type: "numeric", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Point", x => new { x.StrokeId, x.Id });
                    table.ForeignKey(
                        name: "FK_Point_Strokes_StrokeId",
                        column: x => x.StrokeId,
                        principalTable: "Strokes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });
        }
    }
}
