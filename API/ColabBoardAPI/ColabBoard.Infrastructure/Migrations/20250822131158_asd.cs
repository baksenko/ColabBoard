using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace ColabBoard.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class asd : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Cordx",
                table: "Strokes");

            migrationBuilder.DropColumn(
                name: "Cordy",
                table: "Strokes");

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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Point");

            migrationBuilder.AddColumn<decimal>(
                name: "Cordx",
                table: "Strokes",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "Cordy",
                table: "Strokes",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);
        }
    }
}
