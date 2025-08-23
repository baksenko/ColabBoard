using System.ComponentModel.DataAnnotations;

namespace ColabBoard.Domain.Entities;

public class User : BaseEntity
{
    [Required]
    public string Username { get; set; }
    
    [Required]
    public string HashedPassword { get; set; }

    public List<Room> Rooms { get; set; } = new List<Room>();
}
