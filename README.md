# PayloadCMS Relationships Plugin

This plugin makes it easier to list all incoming and outgoing relationships for a given document.

It achieves this by creating a new "relationships" collection which holds all the relationships found in all your collections' documents. When first using this plugin, this "relationships" collection will automatically get populated. Then, whenever a document is created, updated, or deleted, its corresponding entry in the "relationships" collection will be updated accordingly.
