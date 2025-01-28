using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Afantazie.Tools
{
    public static class CitHepCytoscapeImporter
    {
        public static void GenerateJavascriptArray()
        {
            var NODES_LIMIT = 3000;

            Console.WriteLine("Input CitHep file path: ");
            Console.WriteLine("(The file is expected to only contain edge lines in format \"id id\")");
            var inputfilePath = Console.ReadLine();

            var nodes = new List<string>();
            var edges = new List<string>();

            // readthe edges file
            using (var reader = new System.IO.StreamReader(inputfilePath!))
            {
                var line = reader.ReadLine();
                while (line != null)
                {
                    edges.Add(line);
                    var edgeNodes = line.Split('\t');
                    nodes.Add(edgeNodes[0]);
                    nodes.Add(edgeNodes[1]);
                    line = reader.ReadLine();
                }
            }

            // filter duplicates and limit the number of nodes
            nodes = nodes.Distinct().Take(NODES_LIMIT).ToList();

            // filter edges that are not between the nodes
            edges = edges.Where(e => nodes.Contains(e.Split('\t')[0]) && nodes.Contains(e.Split('\t')[1])).ToList();


            StringBuilder sb = new StringBuilder();
            sb.AppendLine("[");

            foreach (var node in nodes)
            {
                sb.AppendLine($"{{ data: {{ id: '{node}' }} }},");
            }

            foreach (var edge in edges)
            {
                var edgeNodes = edge.Split('\t');
                sb.AppendLine($"{{ data: {{ source: '{edgeNodes[0]}', target: '{edgeNodes[1]}' }} }},");
            }
            
            // save the file
            var outputFilePath = inputfilePath + ".output";

            using (var writer = new System.IO.StreamWriter(outputFilePath))
            {
                writer.Write(sb.ToString());
            }
        }           
    }
}
    

