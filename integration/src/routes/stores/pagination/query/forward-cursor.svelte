<script lang="ts">
  import { browser } from '$app/env';
  import { CachePolicy, getHoudiniContext, GQL_StoreForwardCursorPaginationQuery } from '$houdini';

  const context = getHoudiniContext();

  $: browser && GQL_StoreForwardCursorPaginationQuery.fetch();

  function loadNextPage() {
    GQL_StoreForwardCursorPaginationQuery.loadNextPage(context);
  }

  function refetch() {
    GQL_StoreForwardCursorPaginationQuery.fetch({ policy: CachePolicy.NetworkOnly });
  }
</script>

<div id="result">
  {$GQL_StoreForwardCursorPaginationQuery?.data?.usersConnection.edges
    .map(({ node }) => node?.name)
    .join(', ')}
</div>

<div id="pageInfo">
  {JSON.stringify($GQL_StoreForwardCursorPaginationQuery?.pageInfo)}
</div>

<button id="next" on:click={() => loadNextPage()}>next</button>

<button id="refetch" on:click={() => refetch()}>refetch</button>
