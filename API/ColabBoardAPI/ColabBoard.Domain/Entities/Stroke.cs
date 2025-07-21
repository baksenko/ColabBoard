using System.ComponentModel.DataAnnotations;
using System.Net.Http.Json;
using ColabBoard.Domain.Enums;

namespace ColabBoard.Domain.Entities;

public class Stroke : BaseEntity
{
    [Required]
    public Colors Color { get; set; }
    
    [Required]
    public int Cordx { get; set; }
    
    [Required]
    public int Cordy { get; set; }
    
    [Required]
    public Room Room { get; set; }
    
}