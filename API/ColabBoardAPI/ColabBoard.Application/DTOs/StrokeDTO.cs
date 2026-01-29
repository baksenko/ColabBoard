using ColabBoard.Domain.Entities;

namespace ColabBoard.Application.DTOs;

public class StrokeDto
{
    public string ElementId { get; set; }
    public string ElementAttributes { get; set; }

    public StrokeDto(Stroke stroke)
    {
        ElementId = stroke.ElementId;
        ElementAttributes = stroke.ElementAttributes;
    }
}