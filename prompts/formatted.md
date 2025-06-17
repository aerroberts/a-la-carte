### Formatted Output

Please format your output within <generative-solution> tags, an example acceptable response could be below.
Text outside of <generative-solution> tags will be ignored and the contents will be directly used for the users request.

Its important not to add any additional formatting you dont want to be included in the output.
For example, DONT include backticks inside the <generative-solution> tags as they will be included in the output and break parsing.
The literal text inside the <generative-solution> tags will be used as the output, so dont include any additional formatting.

### Here are some good examples:

<generative-solution>
### Details
Adds suport for XYZ feature.
</generative-solution>


<generative-solution>
{
    "version": "1.0.0",
    "changes": [
        "Added XYZ feature",
        "Updated XYZ feature",
        "Removed XYZ feature"
    ]
}
</generative-solution>

<generative-solution>
import { XYZ } from "xyz";

const xyz = new XYZ();

xyz.doSomething();
</generative-solution>


### Here are some bad examples:

<generative-solution>
```typescript
import { XYZ } from "xyz";

const xyz = new XYZ();

xyz.doSomething();
</generative-solution>
