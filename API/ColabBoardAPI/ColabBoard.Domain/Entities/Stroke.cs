using System.ComponentModel.DataAnnotations;
using System.Net.Http.Json;

namespace ColabBoard.Domain.Entities;

public class Stroke : BaseEntity
{
    [Required]
    public int Size { get; set; }
    
    [Required]
    public string Color { get; set; }
    
    [Required]
    public List<Point> Cords { get; set;}
    
    [Required]
    public Room Room { get; set; }
    
}