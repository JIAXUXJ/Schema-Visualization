# Schema-Visualization
Objective
Create a tool to visualize the database schema of a large legacy software application.

Background
Understanding the database schema is often the most important stepping stone when reengineering a legacy software system. The database schema of a software system is akin to the foundation of a building. It contains information of all important business concepts and relationships. In this project milestone, your team will be constructing a tool for visualizing the database schema of a large-scale legacy application (OSCAR EMR).

User Requirements
Your database schema visualization tool should meet the following user requirements:
1. Browser-based and support any modern Web browser as the client. (We will be using Firefox and Chrome for testing.)
2. be able to connect to a MySQL database in order to extract its schema information. The connection parameters should not be hard-coded but configurable as input in your tool. This means that your tool should implement the concept of different "projects". Projects should have names (that can be renamed) and the mysql connection information to be configured. It should also be possible to delete projects.
3. Visualization should be in form of Entity-Relationship (ER) diagrams, with database tables represented as entities (boxes) and foreign keys represented as relationships (lines) (see here for an example: http://gojs.net/latest/samples/entityRelationship.html)
Users should be able to hide or show the attributes (columns) of selected database tables. The application should also support "Show all attributes" and "Hide all attributes"
4. Users should be able to hide or show entities (database tables). (Relationships are always visualized if and only if the two related entities are visible.)
5. Users should be able to expand a diagram based on the selection of a particular entity that it contains. In this case, any entity that is related to the selected entity must be added to the shown diagram.
6. provide different ways to automatically layout ER diagrams (at a minimum including grid layout, force-directed layout, circular layout, and layered digraph layout, see here http://gojs.net/latest/intro/layouts.html) and also allow users to manually change layouts.
7. provide a function to export an image of a displayed diagram.

UVic Seng371 Project
