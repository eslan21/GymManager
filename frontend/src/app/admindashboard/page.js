import SearchBar from "./components/SearchBar"
import UserList from '@/app/admindashboard/components/UserList'

export default function page() {
  return (
    <>
      <div>
        <div className="pb-2">
          <SearchBar />
        </div>
        <div>
          <UserList />
        </div>
      </div>

    </>
  )
}
