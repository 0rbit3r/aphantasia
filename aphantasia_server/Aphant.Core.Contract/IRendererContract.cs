// public async Task<Result> PrintImage()
//     {
//         _log.LogInformation("Saving layout image: {img}", $"{DateTime.Now:yyyy-MM-dd_HHmmss}.png");

//         using var db = _dataContextProvider.GetDataContext();

//         var thoughtsDict = db.Thoughts.Include(t => t.Author).Include(t => t.Links).ToDictionary(t => t.Id);

//         using var image = new Image<Rgba32>(_fdlParams.CurrentValue.Resolution, _fdlParams.CurrentValue.Resolution, Color.White);

//         // Fill background with black
//         image.Mutate(ctx => ctx.Fill(Color.Black));

//         foreach (var thought in db.Thoughts.Include(t => t.Author).Include(t => t.Links))
//         {
//             var resolution = _fdlParams.CurrentValue.Resolution;
//             var scale = _fdlParams.CurrentValue.Scale;
//             var viewportX = _fdlParams.CurrentValue.ViewportPositionX;
//             var viewportY = _fdlParams.CurrentValue.ViewportPositionY;


//             var center = resolution / 2.0;

//             var x = center + (thought.PositionX - viewportX) * scale;
//             var y = center - (thought.PositionY - viewportY) * scale;

//             var radius = GetRadius(thought.SizeMultiplier, _fdlParams.CurrentValue) * _fdlParams.CurrentValue.Scale;
//             var radiusold = (float)(_fdlParams.CurrentValue.BaseRadius
//                 * Math.Pow(_fdlParams.CurrentValue.ReferenceRadiusMultiplier, thought.SizeMultiplier)
//                 * _fdlParams.CurrentValue.Scale);
//             var color = ParseHexColor(thought.Author.Color);

//             // Draw a filled circle at the position
//             var circle = new EllipsePolygon((float)x, (float)y,
//                 Math.Min((float)radius, (float)(_fdlParams.CurrentValue.MaxRadius * _fdlParams.CurrentValue.Scale)));
//             image.Mutate(ctx => ctx.Fill(color, circle));

//             var links = thought.Links.Select(l => l.TargetId);
//             foreach (var link in links)
//             {
//                 if (!thoughtsDict.TryGetValue(link, out var targetThought))
//                     continue;

//                 var targetX = center + (targetThought.PositionX - viewportX) * scale;
//                 var targetY = center - (targetThought.PositionY - viewportY) * scale;

//                 // Draw line between source and target
//                 image.Mutate(ctx => ctx.DrawLine(
//                     new DrawingOptions
//                     {
//                         GraphicsOptions = new GraphicsOptions
//                         {
//                             Antialias = true,
//                             BlendPercentage = 1f,
//                             AlphaCompositionMode = PixelAlphaCompositionMode.SrcOver
//                         }
//                     },
//                 Color.ParseHex(targetThought.Author.Color).WithAlpha(0.3f),
//                 3f,
//                 new PointF((float)x, (float)y), new PointF((float)targetX, (float)targetY)));
//             }
//         }

//         image.Mutate(img => img.Flip(FlipMode.Vertical));

//         await image.SaveAsPngAsync($"{_fdlParams.CurrentValue.LayoutPNGsPath}{DateTime.Now:yyyy-MM-dd_HHmmss}.png");

//         return Result.Success();
//     }