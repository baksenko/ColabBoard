using System.ComponentModel.DataAnnotations;

namespace ColabBoard.Domain.Entities;

public class Room : BaseEntity
{
    [Required]
    public string Name { get; set; }
    
    [Required]
    public List<User> Users { get; set; }
    
    [Required]
    public string HashedPassword { get; set; }
    
    [Required]
    public Guid HeadID { get; set; }
    
    public List<Stroke> Strokes { get; set; }
    
}