// See https://aka.ms/new-console-template for more information

using Microsoft.Extensions.DependencyInjection;
using Afantazie.Data.Repository;
using Afantazie.Tools;
using Microsoft.Extensions.Configuration;
using Afantazie.Data.Interface.Repository;

var services = new ServiceCollection();

services.AddLogging();
services.AddDataModule();

var configuration = new ConfigurationBuilder()
            .SetBasePath(Directory.GetCurrentDirectory()) // Ensure this is the correct path
            .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
            .Build();

services.AddSingleton<IConfiguration>(configuration);

Console.WriteLine(configuration.GetConnectionString("DefaultConnection"));

Console.WriteLine("Continue? y|n");
var confirmation = Console.ReadLine();

if (confirmation != "y")
{
    return;
}

var serviceProvider = services.BuildServiceProvider();

Console.WriteLine(
@"[0]  - Exit
[1]  - Generate Random Thoughts
[2]  - Generate random clustered thoughts
[3]  - Generate random rainbow thoughts
[4]  - Generate Rainbow Tree
[5]  - Import citHep
[6]  - Import citHep to Markdown
[7]  - Retroactively add links to content
[8]  - Retroactively compute sizes
[9]  - Generate javascript cithep array for Cytoscape.js
[10] - Import programming languages influences dataset
[11] - Update link format to brackets");

var choice = Console.ReadLine();
if (!int.TryParse(choice, out var choiceInt))
{
    Console.WriteLine("Invalid choice");
    return;
}

else if (choiceInt == 0)
{
    return;
}

else if (choiceInt == 1)
{
    await RandomThoughtsGenerator.GenerateData(serviceProvider);
}
else if (choiceInt == 2)
{
    await ClusteredThoughtsGenerator.GenerateData(serviceProvider);
}
else if (choiceInt == 3)
{
    await RainbowClustersGenerator.GenerateData(serviceProvider);
}
else if (choiceInt == 4)
{
    await RainbowTreeGenerator.GenerateData(serviceProvider);
}
else if (choiceInt == 5)
{
    await CitHepImporterTemporal.ImportCitHepFileAsync(serviceProvider);
}
else if (choiceInt == 6)
{
    await CitHepObsidianImporter.ImportCitHepFileToObsidianAsync(serviceProvider);
}
else if (choiceInt == 7)
{
    await RetroactiveResponseAdder.AddResponses();
}
else if (choiceInt == 8)
{
    await RetroactiveSizeCalculator.CalculateSizeMultipliers();
}
else if (choiceInt == 9)
{
    CitHepCytoscapeImporter.GenerateJavascriptArray();
}
else if (choiceInt == 10)
{
    await PLInfluenceImporter.ImportPLInfluence(serviceProvider);
}
else if (choiceInt == 11)
{
    await LinkFormatUpdater.UpdateLinkFormat();
}
else
{
    Console.WriteLine("Invalid choice");
    return;
}

Console.WriteLine("Press Enter to exit");
Console.ReadLine();