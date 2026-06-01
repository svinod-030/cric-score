const { Firestore } = require('@google-cloud/firestore');
const firestore = new Firestore();

async function deleteOldRecords() {
  const collectionName = 'matches'; // <-- Change this
  const timestampField = 'lastUpdatedAt';        // <-- Your field

  // Calculate the date 30 days ago
  const oneMonthAgo = new Date();
  oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);
  const oneMonthAgoStr = oneMonthAgo.toISOString();

  console.log(`Starting chunked deletion for docs older than: ${oneMonthAgoStr}`);

  let totalDeleted = 0;
  let hasMore = true;

  while (hasMore) {
    // 1. Only fetch 500 documents at a time to prevent timeouts
    const snapshot = await firestore.collection(collectionName)
      .where(timestampField, '<', oneMonthAgoStr)
      .orderBy(timestampField, 'asc')
      .limit(50) 
      .get();

    if (snapshot.empty) {
      console.log(`\nNo more matching documents found.`);
      hasMore = false;
      break;
    }

    console.log(`Fetched ${snapshot.size} documents. Processing batch...`);

    // 2. Prepare the batch delete
    const batch = firestore.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // 3. Commit the batch
    await batch.commit();
    totalDeleted += snapshot.size;
    console.log(`Successfully deleted ${totalDeleted} documents so far...`);

    // Pause briefly to avoid hitting Firestore rate limits (sustained write limits)
    await new Promise(resolve => setTimeout(resolve, 500));
    if(totalDeleted >100) break;
  }

  console.log(`\nFinished! Total documents deleted: ${totalDeleted}`);
}

deleteOldRecords().catch(console.error);
