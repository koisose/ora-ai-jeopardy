import mongoose from 'mongoose';

const url=process.env.MONGO as string
// Connect to MongoDB and perform operations
export async function saveBulkData(dataArray: any[], database: string) {
    try {
        await mongoose.connect(url);
        console.log('Connected successfully to MongoDB');

        let FlexibleModel;
        try {
            FlexibleModel = mongoose.model(database);
        } catch {
            const flexibleSchema = new mongoose.Schema({}, { strict: false });
            FlexibleModel = mongoose.model(database, flexibleSchema);
        }

        // Use insertMany to save an array of objects
        const docs = await FlexibleModel.insertMany(dataArray, { ordered: false });
        console.log('Inserted documents:', docs);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        mongoose.connection.close();  // Close the connection
        console.log('Connection closed');
    }
}

export async function saveDataById(data: any, database: string) {
  try {
    await mongoose.connect(url);
    console.log('Connected successfully to MongoDB');

    let FlexibleModel;
    try {
      FlexibleModel = mongoose.model(database);
    } catch {
      const flexibleSchema = new mongoose.Schema({}, { strict: false });
      FlexibleModel = mongoose.model(database, flexibleSchema);
    }

    // Use the provided _id from another table
    
   
        //@ts-ignore
       await FlexibleModel.findOneAndUpdate({ _id:data._id }, data, { new: true, upsert: true });
   
    // console.log('Inserted document:', doc);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    mongoose.connection.close();  // Close the connection
    console.log('Connection closed');
  }
}

/**
 * Finds a document in the specified MongoDB database using the provided query and updates it with the given data.
 * If the document does not exist, a new document will be created with the provided data.
 *
 * @param {Object} query - The query to find the document.
 * @param {Object} updateData - The data to update the document with.
 * @param {string} database - The name of the database to connect to.
 * @returns {Promise<Object|null>} - Returns the updated document or null if no document was found.
 *
 * @example
 * const query = { _id: '12345' };
 * const updateData = { name: 'Updated Name', age: 30 };
 * const database = 'myCollection';
 *
 * findAndUpdateData(query, updateData, database)
 *   .then(updatedDocument => {
 *     console.log('Document updated successfully:', updatedDocument);
 *   })
 *   .catch(err => {
 *     console.error('Error updating document:', err);
 *   });
 */
export async function findAndUpdateData(query: any, updateData: any, database: string) {
    try {
        await mongoose.connect(url);
        console.log('Connected successfully to MongoDB');

        let FlexibleModel;
        try {
            FlexibleModel = mongoose.model(database);
        } catch {
            const flexibleSchema = new mongoose.Schema({}, { strict: false });
            FlexibleModel = mongoose.model(database, flexibleSchema);
        }

        // Find the document by query and update it
        //@ts-ignore
        const updatedDocument = await FlexibleModel.findOneAndUpdate(query, updateData, { new: true, upsert: true });
        console.log('Updated document:', updatedDocument);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        mongoose.connection.close();  // Close the connection
        console.log('Connection closed');
    }
}


/**
 * Saves data to a specified MongoDB database.
 * 
 * This function connects to MongoDB, creates a model based on the provided database name, 
 * and saves the provided data as a new document in that database.
 * 
 * @param {any} data - The data to be saved as a document.
 * @param {string} database - The name of the database to which the data will be saved.
 */
export async function saveData(data: any, database: string) {
    try {
        
        await mongoose.connect(url);
        console.log('Connected successfully to MongoDB');

        let FlexibleModel;
        try {
          FlexibleModel = mongoose.model(database);
        } catch {
          const flexibleSchema = new mongoose.Schema({}, { strict: false });
          FlexibleModel = mongoose.model(database, flexibleSchema);
        }

        // Create a new document and save it to the database
        const newDocument = new FlexibleModel(data);
        const doc = await newDocument.save();
        console.log('Inserted document:', doc);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        mongoose.connection.close();  // Close the connection
        console.log('Connection closed');
    }
}
/**
 * This function is used to get data from a specified database.
 * 
 * @param {string} database - The name of the database from which to get data.
 * @returns {Promise} - A promise that resolves to an array of documents from the specified database.
 */

export async function getData(database: string) {
    try {
        await mongoose.connect(url);
        console.log('Connected successfully to MongoDB');

        // Create a model with a flexible schema
        let FlexibleModel;
        try {
          FlexibleModel = mongoose.model(database);
        } catch {
          const flexibleSchema = new mongoose.Schema({}, { strict: false });
          FlexibleModel = mongoose.model(database, flexibleSchema);
        }

        // Retrieve documents from the database and convert _id to string
        //@ts-ignore
        const docs = await FlexibleModel.find({}).lean();
        const docsAsString = docs.map((doc: any) => ({ ...doc, _id: doc._id.toString() }));
        return docsAsString;

    } catch (err) {
        console.error('Error:', err);
    } finally {
        mongoose.connection.close();  // Close the connection
        console.log('Connection closed');
    }
}
/**
 * Deletes all documents from a specified database.
 * 
 * @param {string} database - The name of the database from which to delete all documents.
 */

export async function deleteAllData(database:string) {
    try {
        await mongoose.connect(url);
        console.log('Connected successfully to MongoDB');

        // Create a model with a flexible schema
        let FlexibleModel;
        try {
          FlexibleModel = mongoose.model(database);
        } catch {
          const flexibleSchema = new mongoose.Schema({}, { strict: false });
          FlexibleModel = mongoose.model(database, flexibleSchema);
        }

        // Delete all documents from the database
        await FlexibleModel.deleteMany({});
        console.log('All documents in', database, 'have been deleted');

    } catch (err) {
        console.error('Error:', err);
    } finally {
        mongoose.connection.close();  // Close the connection
        console.log('Connection closed');
    }
}
/**
 * Connects to the MongoDB database and retrieves all documents from a specified database.
 * 
 * @param {string} database - The name of the database to connect to.
 * @returns {Promise<any[]>} - A promise that resolves to an array of documents with their _id converted to string.
 */

export async function deleteDataById(database:string, id:string) {
    try {
        await mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true } as any);
        console.log('Connected successfully to MongoDB');

        // Create a model with a flexible schema
        let FlexibleModel;
        try {
          FlexibleModel = mongoose.model(database);
        } catch {
          const flexibleSchema = new mongoose.Schema({}, { strict: false });
          FlexibleModel = mongoose.model(database, flexibleSchema);
        }

        // Delete a document from the database by its string id
        //@ts-ignore
        const doc = await FlexibleModel.findByIdAndDelete(new mongoose.Types.ObjectId(id));
        if (doc) {
            console.log('Document with id', id, 'has been deleted');
        } else {
            console.log('Document with id', id, 'not found');
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        mongoose.connection.close();  // Close the connection
        console.log('Connection closed');
    }
}
/**
 * @param {string} database - The name of the database.
 * @param {string} id - The id of the document to delete.
 * @returns {Promise<void>} - A promise that resolves when the operation is complete.
 */

export async function getDataById(database:string, id:string) {
    try {
        await mongoose.connect(url);
        console.log('Connected successfully to MongoDB');

        // Create a model with a flexible schema
        let FlexibleModel;
        try {
          FlexibleModel = mongoose.model(database);
        } catch {
          const flexibleSchema = new mongoose.Schema({}, { strict: false });
          FlexibleModel = mongoose.model(database, flexibleSchema);
        }

        // Retrieve a document from the database by its string id
        //@ts-ignore
        const doc = await FlexibleModel.findById(id);
        if (doc) {
            console.log('Document with id', id, 'found');
            return doc;
        } else {
            console.log('Document with id', id, 'not found');
            return null;
        }

    } catch (err) {
        console.error('Error:', err);
        return null;
    } finally {
        mongoose.connection.close();  // Close the connection
        console.log('Connection closed');
    }
}
/**
 * @param {string} database - The name of the database.
 * @param {string} columnName - The name of the column to search by.
 * @param {any} columnValue - The value of the column to search for.
 * @returns {Promise<Array>} - An array of documents that match the search criteria.
 */
export async function getDataByColumnName(database:string, columnName:string, columnValue:any) {
    try {
        await mongoose.connect(url);
        console.log('Connected successfully to MongoDB');

        // Create a model with a flexible schema
        let FlexibleModel;
        try {
          FlexibleModel = mongoose.model(database);
        } catch {
          const flexibleSchema = new mongoose.Schema({}, { strict: false });
          FlexibleModel = mongoose.model(database, flexibleSchema);
        }

        // Retrieve documents from the database by a specific column name and value
        //@ts-ignore
        const docs = await FlexibleModel.find({ [columnName]: columnValue });
        if (docs.length > 0) {
            console.log(`Documents with ${columnName} = ${columnValue} found`);
            return docs;
        } else {
            console.log(`No documents with ${columnName} = ${columnValue} found`);
            return [];
        }

    } catch (err) {
        console.error('Error:', err);
        return [];
    } finally {
        mongoose.connection.close();  // Close the connection
        console.log('Connection closed');
    }
}

